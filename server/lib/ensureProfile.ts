import { storage } from '../storage';
import type { Profile } from '@shared/schema';

interface EnsureProfileInput {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export async function ensureProfile(input: EnsureProfileInput): Promise<Profile> {
  const existing = await storage.getProfile(input.id);
  if (existing) return existing;

  console.log('[ensureProfile] Creating Neon profile for user:', input.id, input.email);

  try {
    const profile = await storage.createProfile({
      id: input.id,
      email: input.email || null,
      username: input.username || (input.email ? input.email.split('@')[0] : `user_${input.id.slice(-6)}`),
      full_name: input.full_name || null,
      avatar_url: input.avatar_url || null,
      user_type: 'buyer',
    } as any);
    console.log('[ensureProfile] Created profile:', profile.id, profile.username);
    return profile;
  } catch (err: any) {
    if (err?.code === '23505') {
      const retried = await storage.getProfile(input.id);
      if (retried) {
        console.log('[ensureProfile] Profile existed (race), fetched:', retried.id);
        return retried;
      }
    }
    console.error('[ensureProfile] Failed:', err);
    throw err;
  }
}
