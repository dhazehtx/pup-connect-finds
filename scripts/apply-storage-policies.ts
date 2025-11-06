import { supabaseAdmin } from '../server/lib/supabaseAdmin';

/**
 * Apply storage policies for provider-id-docs bucket
 * This script creates RLS policies to allow authenticated users to upload ID documents
 */
async function applyStoragePolicies() {
  console.log('[MIGRATION] Applying storage policies for provider-id-docs bucket...');

  const sql = `
-- Storage policies for provider ID documents
-- Allow anyone to view ID documents (public bucket)
CREATE POLICY IF NOT EXISTS "Anyone can view provider ID documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'provider-id-docs');

-- Allow authenticated users to upload their own ID documents
CREATE POLICY IF NOT EXISTS "Authenticated users can upload provider ID documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'provider-id-docs' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to update their own ID documents
CREATE POLICY IF NOT EXISTS "Users can update their own provider ID documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'provider-id-docs' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to delete their own ID documents
CREATE POLICY IF NOT EXISTS "Users can delete their own provider ID documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'provider-id-docs' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
  `;

  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('[MIGRATION] Error:', error);
      throw error;
    }
    
    console.log('[MIGRATION] ✅ Storage policies applied successfully!');
    return data;
  } catch (error: any) {
    console.error('[MIGRATION] Failed to apply storage policies:', error.message);
    console.log('\n[MIGRATION] Please run this SQL manually in the Supabase SQL Editor:');
    console.log(sql);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  applyStoragePolicies()
    .then(() => {
      console.log('[MIGRATION] Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[MIGRATION] Failed:', error);
      process.exit(1);
    });
}

export { applyStoragePolicies };
