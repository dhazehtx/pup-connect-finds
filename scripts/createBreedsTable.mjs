import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key exists:', !!supabaseServiceRoleKey);

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const breeds = [
  { name: 'Labrador Retriever', popularity_rank: 1 },
  { name: 'Golden Retriever', popularity_rank: 2 },
  { name: 'German Shepherd', popularity_rank: 3 },
  { name: 'French Bulldog', popularity_rank: 4 },
  { name: 'Bulldog', popularity_rank: 5 },
  { name: 'Poodle', popularity_rank: 6 },
  { name: 'Beagle', popularity_rank: 7 },
  { name: 'Rottweiler', popularity_rank: 8 },
  { name: 'Yorkshire Terrier', popularity_rank: 9 },
  { name: 'German Shorthaired Pointer', popularity_rank: 10 },
  { name: 'Siberian Husky', popularity_rank: 11 },
  { name: 'Dachshund', popularity_rank: 12 },
  { name: 'Pembroke Welsh Corgi', popularity_rank: 13 },
  { name: 'Australian Shepherd', popularity_rank: 14 },
  { name: 'Boston Terrier', popularity_rank: 15 },
  { name: 'Bernese Mountain Dog', popularity_rank: 16 },
  { name: 'Boxer', popularity_rank: 17 },
  { name: 'Cocker Spaniel', popularity_rank: 18 },
  { name: 'Border Collie', popularity_rank: 19 },
  { name: 'Great Dane', popularity_rank: 20 },
  { name: 'Pomeranian', popularity_rank: 21 },
  { name: 'Shih Tzu', popularity_rank: 22 },
  { name: 'Mastiff', popularity_rank: 23 },
  { name: 'Chihuahua', popularity_rank: 24 },
  { name: 'Brittany', popularity_rank: 25 },
  { name: 'Shetland Sheepdog', popularity_rank: 26 },
  { name: 'Belgian Malinois', popularity_rank: 27 },
  { name: 'Weimaraner', popularity_rank: 28 },
  { name: 'Miniature Schnauzer', popularity_rank: 29 },
  { name: 'Cavalier King Charles Spaniel', popularity_rank: 30 },
  { name: 'Doberman Pinscher', popularity_rank: 31 },
  { name: 'Australian Cattle Dog', popularity_rank: 32 },
  { name: 'Cane Corso', popularity_rank: 33 },
  { name: 'Collie', popularity_rank: 34 },
  { name: 'Rhodesian Ridgeback', popularity_rank: 35 },
  { name: 'Newfoundland', popularity_rank: 36 },
  { name: 'West Highland White Terrier', popularity_rank: 37 },
  { name: 'Saint Bernard', popularity_rank: 38 },
  { name: 'Bloodhound', popularity_rank: 39 },
  { name: 'Bull Terrier', popularity_rank: 40 },
  { name: 'Basset Hound', popularity_rank: 41 },
  { name: 'Bichon Frise', popularity_rank: 42 },
  { name: 'Akita', popularity_rank: 43 },
  { name: 'Portuguese Water Dog', popularity_rank: 44 },
  { name: 'Whippet', popularity_rank: 45 },
  { name: 'Alaskan Malamute', popularity_rank: 46 },
  { name: 'Scottish Terrier', popularity_rank: 47 },
  { name: 'Australian Terrier', popularity_rank: 48 },
  { name: 'Chinese Shar-Pei', popularity_rank: 49 },
  { name: 'Vizsla', popularity_rank: 50 }
];

async function setupBreedsTable() {
  try {
    console.log('Setting up breeds table in Supabase...');
    
    // Create the breeds table using SQL
    const { data: createData, error: createError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS breeds (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          popularity_rank INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_breeds_popularity_rank ON breeds(popularity_rank);
      `
    });

    if (createError) {
      console.log('Table may already exist or SQL function not available, trying direct insert...');
    } else {
      console.log('Table created successfully');
    }
    
    // Insert breeds
    console.log('Inserting breeds...');
    const { data, error } = await supabase
      .from('breeds')
      .upsert(breeds, { onConflict: 'name' });
    
    if (error) {
      console.error('Error inserting breeds:', error);
    } else {
      console.log('Successfully inserted/updated breeds');
    }
    
    // Verify count
    const { count } = await supabase
      .from('breeds')
      .select('*', { count: 'exact' });
      
    console.log(`Total breeds in table: ${count}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setupBreedsTable();