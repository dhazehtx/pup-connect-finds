import { storage } from '../storage';
import type { Profile } from '@shared/schema';
import { EmailService } from '../utils/emailService';

/**
 * Neutral, non-PII default public handle. Public identity must NEVER default to
 * the user's email or its local-part (that leaked email fragments through search
 * and profiles). Derived from the account id, which is unique.
 */
function neutralUsername(id: string): string {
  return `user_${id.replace(/-/g, '').slice(-8)}`;
}

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
      username: input.username?.trim() || neutralUsername(input.id),
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

export async function ensureProfileDetailed(
  input: EnsureProfileInput,
): Promise<{ profile: Profile; created: boolean; hadExisting: boolean }> {
  const existing = await storage.getProfile(input.id);
  if (existing) {
    return { profile: existing, created: false, hadExisting: true };
  }

  const username = input.username?.trim() || neutralUsername(input.id);

  const profile = await ensureProfile({
    ...input,
    username,
  });

  const created = !existing;
  if (created && input.email) {
    void EmailService.sendWelcomeEmail(input.email, username).catch((err) => {
      console.warn('[ensureProfile] Welcome email failed (non-blocking):', err);
    });
  }

  return { profile, created: true, hadExisting: false };
}
