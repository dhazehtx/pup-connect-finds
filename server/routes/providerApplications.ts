import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { notificationService } from "../services/notificationService";

const router = Router();

// Submit provider application (Step 7 of onboarding)
router.post("/submit", async (req, res) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ 
        ok: false, 
        error: "Provider ID is required" 
      });
    }

    // Get user from session/auth (simplified for now)
    let userId = req.body.userId; // Temporary fallback
    
    if (!userId) {
      // Try to get from auth header or session
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
          userId = user?.id;
        } catch {
          // Fallback for development
        }
      }
    }

    if (!userId) {
      return res.status(401).json({ 
        ok: false, 
        error: "User authentication required" 
      });
    }

    console.log('[PROVIDER APP] Submitting application:', { providerId, userId });

    // Check if provider exists
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      console.error('[PROVIDER APP] Provider not found:', providerError);
      return res.status(404).json({ 
        ok: false, 
        error: "Provider not found" 
      });
    }

    // Check if application already exists
    const { data: existingApp } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (existingApp) {
      return res.status(400).json({ 
        ok: false, 
        error: "Application already submitted" 
      });
    }

    // Create application
    const { data: application, error } = await supabase
      .from('provider_applications')
      .insert({
        user_id: userId,
        provider_id: providerId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error('[PROVIDER APP] Error creating application:', error);
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to create application" 
      });
    }

    console.log('[PROVIDER APP] Application created:', application);

    // Notify admins
    try {
      await notificationService.notifyAdmins({
        type: 'provider_app_submitted',
        message: `New provider application submitted by ${provider.legal_name}`,
        entityTable: 'provider_applications',
        entityId: application.id,
        targetUrl: `/admin/applications/${application.id}`,
        actorId: userId,
        meta: {
          providerName: provider.legal_name,
          applicationId: application.id
        }
      });
      console.log('[PROVIDER APP] Admin notified successfully');
    } catch (notifyError) {
      console.error('[PROVIDER APP] Failed to notify admin:', notifyError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({ 
      ok: true, 
      application 
    });

  } catch (error) {
    console.error('[PROVIDER APP] Submit error:', error);
    res.status(500).json({ 
      ok: false, 
      error: String(error) 
    });
  }
});

// Admin review endpoint
router.post("/review", async (req, res) => {
  try {
    const { applicationId, action, notes } = req.body;

    if (!applicationId || !action) {
      return res.status(400).json({ 
        ok: false, 
        error: "Application ID and action are required" 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        ok: false, 
        error: "Action must be 'approve' or 'reject'" 
      });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    // Update application
    const { data: application, error } = await supabase
      .from('provider_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null
      })
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error || !application) {
      console.error('[PROVIDER APP] Error updating application:', error);
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to update application" 
      });
    }

    console.log('[PROVIDER APP] Application reviewed:', application);

    // Update provider status if approved
    if (status === 'approved') {
      await supabase
        .from('providers')
        .update({ status: 'verified' })
        .eq('id', application.provider_id);
    }

    // Notify applicant
    try {
      // Notify applicant of result
      await notificationService.createNotification({
        recipientId: application.user_id,
        type: status === 'approved' ? 'provider_app_approved' : 'provider_app_rejected',
        message: status === 'approved' 
          ? 'Your provider application has been approved!' 
          : 'Your provider application has been reviewed.',
        entityTable: 'provider_applications',
        entityId: application.id,
        targetUrl: '/services/provider/dashboard',
        meta: { status, notes }
      });
      console.log('[PROVIDER APP] Applicant notified successfully');
    } catch (notifyError) {
      console.error('[PROVIDER APP] Failed to notify applicant:', notifyError);
    }

    res.json({ 
      ok: true, 
      application 
    });

  } catch (error) {
    console.error('[PROVIDER APP] Review error:', error);
    res.status(500).json({ 
      ok: false, 
      error: String(error) 
    });
  }
});

// Get applications for admin
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('provider_applications')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        ),
        providers:provider_id (
          id,
          legal_name,
          phone,
          service_types
        )
      `)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('[PROVIDER APP] Error fetching applications:', error);
      return res.status(500).json({ 
        ok: false, 
        error: "Failed to fetch applications" 
      });
    }

    res.json({ 
      ok: true, 
      applications: applications || [] 
    });

  } catch (error) {
    console.error('[PROVIDER APP] Fetch error:', error);
    res.status(500).json({ 
      ok: false, 
      error: String(error) 
    });
  }
});

// Get single application
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: application, error } = await supabase
      .from('provider_applications')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          avatar_url
        ),
        providers:provider_id (
          id,
          legal_name,
          phone,
          service_types
        )
      `)
      .eq('id', id)
      .single();

    if (error || !application) {
      return res.status(404).json({ 
        ok: false, 
        error: "Application not found" 
      });
    }

    res.json({ 
      ok: true, 
      application 
    });

  } catch (error) {
    console.error('[PROVIDER APP] Get application error:', error);
    res.status(500).json({ 
      ok: false, 
      error: String(error) 
    });
  }
});

export default router;