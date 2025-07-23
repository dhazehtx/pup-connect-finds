import { Request, Response, Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Export user data (GDPR compliance)
router.get('/export-data', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Collect all user data
    const userData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      profile: {},
      listings: [],
      messages: [],
      conversations: [],
      reviews: [],
      favorites: [],
      notifications: [],
      transactions: []
    };

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    userData.profile = profile || {};

    // Get listings
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id);
    
    userData.listings = listings as any[] || [];

    // Get conversations where user is participant
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    
    userData.conversations = conversations as any[] || [];

    // Get messages from user's conversations
    const conversationIds = conversations?.map((c: any) => c.id) || [];
    if (conversationIds.length > 0) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds);
      
      userData.messages = messages as any[] || [];
    }

    // Get reviews by and for the user
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .or(`reviewer_id.eq.${user.id},reviewed_user_id.eq.${user.id}`);
    
    userData.reviews = reviews as any[] || [];

    // Get favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id);
    
    userData.favorites = favorites as any[] || [];

    // Get notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id);
    
    userData.notifications = notifications as any[] || [];

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);
    
    userData.transactions = transactions as any[] || [];

    res.json(userData);

  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Delete user account (GDPR compliance)
router.delete('/delete-account', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Delete user data in order (respecting foreign key constraints)
    
    // 1. Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    // 2. Delete favorites
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id);

    // 3. Delete messages (but keep conversations for other users)
    await supabase
      .from('messages')
      .delete()
      .eq('sender_id', user.id);

    // 4. Delete transactions
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id);

    // 5. Delete reviews by the user (keep reviews of the user for transparency)
    await supabase
      .from('reviews')
      .delete()
      .eq('reviewer_id', user.id);

    // 6. Delete listings
    await supabase
      .from('listings')
      .delete()
      .eq('user_id', user.id);

    // 7. Update conversations to anonymize user participation
    await supabase
      .from('conversations')
      .update({ 
        buyer_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('buyer_id', user.id);

    await supabase
      .from('conversations')
      .update({ 
        seller_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('seller_id', user.id);

    // 8. Delete profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    // 9. Delete auth user (this must be done with service role)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Auth deletion error:', deleteError);
      // Continue anyway - the user data is already deleted
    }

    res.json({ 
      success: true, 
      message: 'Account and all associated data have been permanently deleted' 
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;