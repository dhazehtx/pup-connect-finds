// Storage utilities for handling file uploads with Supabase
import { supabase } from '@/integrations/supabase/client';

export async function uploadIdImage(opts: {
  userId: string;
  providerId: string;
  side: "front" | "back";
  file: File;
  contentType?: string;
}): Promise<string> {
  const ts = Date.now();
  const ext = (opts.contentType?.split("/")?.[1]) || "jpg";
  const path = `${opts.userId}/${opts.providerId}/id-${opts.side}-${ts}.${ext}`;
  
  const { error } = await supabase
    .storage
    .from("provider-id")
    .upload(path, opts.file, { 
      upsert: true, 
      contentType: opts.contentType || "image/jpeg" 
    });
    
  if (error) throw error;
  return path; // private path, not public URL
}

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) throw new Error("Not authenticated");
  return data.user.id;
}