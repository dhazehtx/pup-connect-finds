import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import { getServerSupabaseApiUrl } from './lib/serverSupabaseEnv';
import { serviceRoleSupabaseOptions } from './lib/serviceSupabaseOptions';
import { storage } from './storage';

/**
 * A socket is authorized for a conversation only if it has actually JOINED the
 * `conv:<id>` room — and join is gated by a DB participant check below. Relay
 * handlers (message/typing/read) therefore require room membership, which prevents
 * a non-participant from injecting or spoofing events into someone else's thread
 * (socket.to(room) broadcasts regardless of membership, so we must check it).
 */
const inConversationRoom = (socket: Socket, conversationId: unknown): conversationId is string =>
  typeof conversationId === 'string' && socket.rooms.has(`conv:${conversationId}`);

const supabaseUrl = getServerSupabaseApiUrl();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, serviceRoleSupabaseOptions);
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

const onlineUsers = new Map<string, Set<string>>();
const typingUsers = new Map<string, Map<string, { name: string; timeout: NodeJS.Timeout }>>();

let ioInstance: Server | null = null;

export function getIO(): Server | null {
  return ioInstance;
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (!ioInstance) return;
  const userSockets = onlineUsers.get(userId);
  if (userSockets) {
    Array.from(userSockets).forEach(socketId => {
      ioInstance!.to(socketId).emit(event, data);
    });
  }
}

export function setupSocketIO(httpServer: HttpServer): Server {
  // SECURITY: restrict Socket.IO CORS to the app origin(s) in production instead of
  // the previous wildcard '*'. Falls back to '*' only when no origin env is set
  // (local dev), so it never breaks a configured deployment. Handshake auth (below)
  // still verifies a Supabase JWT regardless.
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.BASE_URL,
    process.env.PUBLIC_APP_URL,
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5000',
  ].filter((o): o is string => Boolean(o));
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins.length > 0 ? allowedOrigins : '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  ioInstance = io;

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || !supabase) {
      return next(new Error('Authentication required'));
    }
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return next(new Error('Invalid token'));
      }
      socket.userId = user.id;
      socket.userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const userId = socket.userId!;
    const userName = socket.userName!;

    console.log(`[Socket.io] User connected: ${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    io.emit('presence:online', { userId, userName });

    socket.emit('presence:list', { users: Array.from(onlineUsers.keys()) });

    socket.on('presence:list', () => {
      socket.emit('presence:list', { users: Array.from(onlineUsers.keys()) });
    });

    socket.on('join:conversation', async (conversationId: string) => {
      // SECURITY: only conversation participants may join the room (and thus
      // receive live messages/typing/read). Verified against the DB once, here.
      try {
        if (typeof conversationId !== 'string') return;
        const isParticipant = await storage.isConversationParticipant(conversationId, userId);
        if (!isParticipant) {
          socket.emit('join:denied', { conversationId });
          return;
        }
        socket.join(`conv:${conversationId}`);
      } catch {
        socket.emit('join:denied', { conversationId });
      }
    });

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
      const convTyping = typingUsers.get(conversationId);
      if (convTyping?.has(userId)) {
        clearTimeout(convTyping.get(userId)!.timeout);
        convTyping.delete(userId);
        socket.to(`conv:${conversationId}`).emit('typing:stop', {
          userId,
          conversationId,
        });
      }
    });

    socket.on('message:new', (data: { conversationId: string; message: any }) => {
      // SECURITY: only relay if this socket is an authorized member of the room
      // (join is participant-gated), so a non-participant cannot inject a spoofed
      // message into another user's open chat. Authoritative persistence still goes
      // through POST /api/messaging/messages (which re-checks participation).
      if (!inConversationRoom(socket, data?.conversationId)) return;
      socket.to(`conv:${data.conversationId}`).emit('message:new', data.message);
    });

    socket.on('typing:start', (data: { conversationId: string }) => {
      const { conversationId } = data;
      if (!inConversationRoom(socket, conversationId)) return;
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Map());
      }
      const convTyping = typingUsers.get(conversationId)!;
      if (convTyping.has(userId)) {
        clearTimeout(convTyping.get(userId)!.timeout);
      }
      const timeout = setTimeout(() => {
        convTyping.delete(userId);
        socket.to(`conv:${conversationId}`).emit('typing:stop', {
          userId,
          userName,
          conversationId,
        });
      }, 3000);
      convTyping.set(userId, { name: userName, timeout });
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        userId,
        userName,
        conversationId,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      const { conversationId } = data;
      if (!inConversationRoom(socket, conversationId)) return;
      const convTyping = typingUsers.get(conversationId);
      if (convTyping?.has(userId)) {
        clearTimeout(convTyping.get(userId)!.timeout);
        convTyping.delete(userId);
      }
      socket.to(`conv:${conversationId}`).emit('typing:stop', {
        userId,
        userName,
        conversationId,
      });
    });

    socket.on('messages:read', (data: { conversationId: string }) => {
      if (!inConversationRoom(socket, data?.conversationId)) return;
      socket.to(`conv:${data.conversationId}`).emit('messages:read', {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] User disconnected: ${userId}`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:offline', { userId });
        }
      }
      typingUsers.forEach((convTyping, conversationId) => {
        if (convTyping.has(userId)) {
          clearTimeout(convTyping.get(userId)!.timeout);
          convTyping.delete(userId);
          io.to(`conv:${conversationId}`).emit('typing:stop', {
            userId,
            conversationId,
          });
        }
      });
    });
  });

  console.log('[Socket.io] Server initialized');
  return io;
}
