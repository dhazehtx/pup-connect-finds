import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

const onlineUsers = new Map<string, Set<string>>();
const typingUsers = new Map<string, Map<string, { name: string; timeout: NodeJS.Timeout }>>();

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

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

    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
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
      socket.to(`conv:${data.conversationId}`).emit('message:new', data.message);
    });

    socket.on('typing:start', (data: { conversationId: string }) => {
      const { conversationId } = data;
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
