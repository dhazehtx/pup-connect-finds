
import { supabase } from '@/integrations/supabase/client';
import { sampleUsers } from '@/data/sampleUsers';
import { sampleDogListings } from '@/data/sampleDogListings';
import { sampleReviews } from '@/data/sampleReviews';
import { sampleConversations, sampleMessages } from '@/data/sampleConversations';

export const loadSampleData = async () => {
  try {
    console.log('Loading sample data...');

    // Load sample profiles (users)
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert(sampleUsers, { onConflict: 'id' });

    if (profilesError) {
      console.error('Error loading sample profiles:', profilesError);
      return false;
    }

    // Load sample dog listings
    const { error: listingsError } = await supabase
      .from('dog_listings')
      .upsert(sampleDogListings, { onConflict: 'id' });

    if (listingsError) {
      console.error('Error loading sample listings:', listingsError);
      return false;
    }

    // Load sample reviews
    const { error: reviewsError } = await supabase
      .from('reviews')
      .upsert(sampleReviews, { onConflict: 'id' });

    if (reviewsError) {
      console.error('Error loading sample reviews:', reviewsError);
      return false;
    }

    // Load sample conversations
    const { error: conversationsError } = await supabase
      .from('conversations')
      .upsert(sampleConversations, { onConflict: 'id' });

    if (conversationsError) {
      console.error('Error loading sample conversations:', conversationsError);
      return false;
    }

    // Load sample messages
    const { error: messagesError } = await supabase
      .from('messages')
      .upsert(sampleMessages, { onConflict: 'id' });

    if (messagesError) {
      console.error('Error loading sample messages:', messagesError);
      return false;
    }

    console.log('Sample data loaded successfully!');
    return true;
  } catch (error) {
    console.error('Error loading sample data:', error);
    return false;
  }
};

export const clearSampleData = async () => {
  try {
    console.log('Clearing sample data...');

    // Clear in reverse order to respect foreign key constraints
    await supabase.from('messages').delete().in('id', sampleMessages.map(m => m.id));
    await supabase.from('conversations').delete().in('id', sampleConversations.map(c => c.id));
    await supabase.from('reviews').delete().in('id', sampleReviews.map(r => r.id));
    await supabase.from('dog_listings').delete().in('id', sampleDogListings.map(l => l.id));
    await supabase.from('profiles').delete().in('id', sampleUsers.map(u => u.id));

    console.log('Sample data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
};
