import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { notificationService } from "../services/notificationService";

const router = Router();

// Submit provider application (Step 7 of onboarding)
router.post("/submit", async (req, res) => {
  try {
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({
        ok: false,
        error: "Provider ID is required",
      });
    }

    // Get user from session/auth (simplified for now)
    let userId = req.body.userId; // Temporary fallback

    if (!userId) {
      // Try to get from auth header or session
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
          userId = user?.id;
        } catch {
          // Fallback for development
        }
      }
    }

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "User authentication required",
      });
    }

    console.log("[PROVIDER APP] Submitting application:", {
      providerId,
      userId,
    });

    // Check if provider exists
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("*")
      .eq("id", providerId)
      .single();

    if (providerError || !provider) {
      console.error("[PROVIDER APP] Provider not found:", providerError);
      return res.status(404).json({
        ok: false,
        error: "Provider not found",
      });
    }

    // Check if application already exists
    const { data: existingApp } = await supabase
      .from("provider_applications")
      .select("*")
      .eq("provider_id", providerId)
      .single();

    if (existingApp) {
      return res.status(400).json({
        ok: false,
        error: "Application already submitted",
      });
    }

    // Create application
    const { data: application, error } = await supabase
      .from("provider_applications")
      .insert({
        user_id: userId,
        provider_id: providerId,
        status: "submitted",
        verification_status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      console.error("[PROVIDER APP] Error creating application:", error);
      return res.status(500).json({
        ok: false,
        error: "Failed to create application",
      });
    }

    console.log("[PROVIDER APP] Application created:", application);

    // Notify admins
    try {
      await notificationService.notifyAdmins({
        type: "provider_app_submitted",
        message: `New provider application submitted by ${provider.legal_name}`,
        entityTable: "provider_applications",
        entityId: application.id,
        targetUrl: `/admin/applications/${application.id}`,
        actorId: userId,
        meta: {
          providerName: provider.legal_name,
          applicationId: application.id,
        },
      });
      console.log("[PROVIDER APP] Admin notified successfully");
    } catch (notifyError) {
      console.error("[PROVIDER APP] Failed to notify admin:", notifyError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      ok: true,
      application,
    });
  } catch (error) {
    console.error("[PROVIDER APP] Submit error:", error);
    res.status(500).json({
      ok: false,
      error: String(error),
    });
  }
});

// Admin review endpoint (uses supabaseAdmin)
router.post("/review", async (req, res) => {
  try {
    const { applicationId, action, notes } = req.body;

    if (!applicationId || !action) {
      return res.status(400).json({
        ok: false,
        error: "Application ID and action are required",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        ok: false,
        error: "Action must be 'approve' or 'reject'",
      });
    }

    const status = action === "approve" ? "approved" : "rejected";

    // Update application using admin client to bypass RLS
    const { data: application, error } = await supabaseAdmin
      .from("provider_applications")
      .update({
        status,
        verification_status: status, // Keep both fields in sync
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq("id", applicationId)
      .eq("status", "submitted") // Prevent race conditions - only update if still submitted
      .select("*")
      .single();

    if (error) {
      console.error("[PROVIDER APP] Error updating application:", error);
      return res.status(500).json({
        ok: false,
        error: "Failed to update application",
      });
    }

    if (!application) {
      return res.status(404).json({
        ok: false,
        error: "Application not found or already reviewed",
      });
    }

    console.log("[PROVIDER APP] Application reviewed:", application);

    // Update provider status if approved (with error handling)
    if (status === "approved" && application.provider_id) {
      try {
        const { error: providerError } = await supabaseAdmin
          .from("providers")
          .update({
            status: "verified",
            verified: true,
          })
          .eq("id", application.provider_id);

        if (providerError) {
          console.error(
            "[PROVIDER APP] Failed to update provider:",
            providerError,
          );
          // Don't fail the request, but log the error
        } else {
          console.log("[PROVIDER APP] Provider marked as verified");
        }
      } catch (providerUpdateError) {
        console.error(
          "[PROVIDER APP] Provider update exception:",
          providerUpdateError,
        );
      }

      // Update user profile (with error handling)
      try {
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ verified: true })
          .eq("id", application.user_id);

        if (profileError) {
          console.error(
            "[PROVIDER APP] Failed to update profile:",
            profileError,
          );
        } else {
          console.log("[PROVIDER APP] User profile marked as verified");
        }
      } catch (profileUpdateError) {
        console.error(
          "[PROVIDER APP] Profile update exception:",
          profileUpdateError,
        );
      }
    }

    // Notify applicant
    try {
      await notificationService.createNotification({
        recipientId: application.user_id,
        type:
          status === "approved"
            ? "provider_app_approved"
            : "provider_app_rejected",
        message:
          status === "approved"
            ? "Your provider application has been approved!"
            : "Your provider application has been reviewed.",
        entityTable: "provider_applications",
        entityId: application.id,
        targetUrl: "/services/provider/dashboard",
        meta: { status, notes },
      });
      console.log("[PROVIDER APP] Applicant notified successfully");
    } catch (notifyError) {
      console.error("[PROVIDER APP] Failed to notify applicant:", notifyError);
    }

    res.json({
      ok: true,
      application,
    });
  } catch (error) {
    console.error("[PROVIDER APP] Review error:", error);
    res.status(500).json({
      ok: false,
      error: String(error),
    });
  }
});

// Get applications for admin (uses supabaseAdmin for secure access)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from("provider_applications")
      .select(
        `
        id,
        user_id,
        provider_id,
        status,
        verification_status,
        submitted_at,
        reviewed_at,
        review_notes,
        front_image_url,
        back_image_url
        `
      )
      .order("submitted_at", { ascending: false });

    // Filter for pending applications (status='submitted' AND verification_status='pending')
    if (status === "pending") {
      query = query
        .eq("status", "submitted")
        .eq("verification_status", "pending");
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error("[PROVIDER APP] Error fetching applications:", error);
      return res.status(500).json({
        ok: false,
        error: "Failed to fetch applications",
        data: [],
      });
    }

    // Transform data to match frontend expectations
    const transformedData = (applications || []).map((app: any) => ({
      id: app.id,
      user_id: app.user_id,
      provider_id: app.provider_id,
      front_image_url: app.front_image_url,
      back_image_url: app.back_image_url,
      verification_status: app.verification_status,
      created_at: app.submitted_at || app.created_at,
      user: app.profiles
        ? {
            id: app.profiles.id,
            username: app.profiles.username || "user",
            full_name: app.profiles.full_name || "Unknown User",
            email: app.profiles.email,
            avatar_url: app.profiles.avatar_url,
          }
        : {
            id: app.user_id,
            username: "user",
            full_name: "Unknown User",
            email: "",
            avatar_url: null,
          },
      // Add placeholder fields that the frontend expects but aren't in the DB
      service_type: "provider",
      bio: "Service provider application",
      price: "0",
      location: null,
      availability: null,
    }));

    res.json({
      ok: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("[PROVIDER APP] Fetch error:", error);
    res.status(500).json({
      ok: false,
      error: String(error),
      data: [],
    });
  }
});

// PATCH endpoint for approve/reject (admin only, uses supabaseAdmin)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !["verified", "rejected", "approved"].includes(status)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid status. Must be 'verified', 'approved', or 'rejected'",
      });
    }

    // Map 'verified' to 'approved' for consistency
    const dbStatus = status === "verified" ? "approved" : status;

    console.log(
      `[PROVIDER APP] Updating application ${id} to status: ${dbStatus}`,
    );

    // Update application status with race condition protection
    const { data: application, error } = await supabaseAdmin
      .from("provider_applications")
      .update({
        status: dbStatus,
        verification_status: dbStatus, // Keep both fields in sync
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq("id", id)
      .eq("status", "submitted") // Prevent race conditions - only update if still submitted
      .select(
        `
        id,
        user_id,
        provider_id,
        status,
        verification_status,
        submitted_at,
        reviewed_at,
        review_notes,
        front_image_url,
        back_image_url
      `
      )
      .single();

    if (error) {
      console.error("[PROVIDER APP] Error updating application:", error);
      return res.status(500).json({
        ok: false,
        error: "Failed to update application",
      });
    }

    if (!application) {
      return res.status(404).json({
        ok: false,
        error: "Application not found or already reviewed",
      });
    }

    console.log("[PROVIDER APP] Application updated:", application);

    // Update provider status if approved (with error handling)
    if (dbStatus === "approved" && application.provider_id) {
      try {
        const { error: providerError } = await supabaseAdmin
          .from("providers")
          .update({
            status: "verified",
            verified: true,
          })
          .eq("id", application.provider_id);

        if (providerError) {
          console.error(
            "[PROVIDER APP] Failed to update provider:",
            providerError,
          );
          // Return error to admin so they know something went wrong
          return res.status(500).json({
            ok: false,
            error:
              "Application updated but failed to verify provider. Please contact support.",
          });
        }
        console.log("[PROVIDER APP] Provider marked as verified");
      } catch (providerUpdateError) {
        console.error(
          "[PROVIDER APP] Provider update exception:",
          providerUpdateError,
        );
        return res.status(500).json({
          ok: false,
          error: "Application updated but provider verification failed.",
        });
      }

      // Update user profile (with error handling)
      try {
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ verified: true })
          .eq("id", application.user_id);

        if (profileError) {
          console.error(
            "[PROVIDER APP] Failed to update profile:",
            profileError,
          );
          // Don't fail the request for profile update, just log
        } else {
          console.log("[PROVIDER APP] User profile marked as verified");
        }
      } catch (profileUpdateError) {
        console.error(
          "[PROVIDER APP] Profile update exception:",
          profileUpdateError,
        );
      }
    }

    // Notify applicant
    try {
      await notificationService.createNotification({
        recipientId: application.user_id,
        type:
          dbStatus === "approved"
            ? "provider_app_approved"
            : "provider_app_rejected",
        message:
          dbStatus === "approved"
            ? "Your service provider application has been approved!"
            : "Your service provider application has been reviewed.",
        entityTable: "provider_applications",
        entityId: application.id,
        targetUrl: "/services/provider/dashboard",
        meta: { status: dbStatus, notes },
      });
      console.log("[PROVIDER APP] Applicant notified successfully");
    } catch (notifyError) {
      console.error("[PROVIDER APP] Failed to notify applicant:", notifyError);
    }

    // Transform response to match frontend expectations
    const transformedApplication = {
      id: application.id,
      user_id: application.user_id,
      provider_id: application.provider_id,
      front_image_url: application.front_image_url,
      back_image_url: application.back_image_url,
      verification_status: application.verification_status,
      created_at: application.submitted_at,
      user: {
        id: application.user_id,
        username: "user",
        full_name: "Unknown User",
        email: "",
        avatar_url: null,
      },
      service_type: "provider",
      bio: "Service provider application",
      price: "0",
      location: null,
      availability: null,
    };

    res.json({
      ok: true,
      application: transformedApplication,
    });
  } catch (error) {
    console.error("[PROVIDER APP] Update error:", error);
    res.status(500).json({
      ok: false,
      error: String(error),
    });
  }
});

// Get single application
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: application, error } = await supabaseAdmin
      .from("provider_applications")
      .select(
        `
        id,
        user_id,
        provider_id,
        status,
        verification_status,
        submitted_at,
        reviewed_at,
        review_notes,
        front_image_url,
        back_image_url
      `
      )
      .eq("id", id)
      .single();

    if (error || !application) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    // Transform to match frontend expectations
    const transformedApplication = {
      id: application.id,
      user_id: application.user_id,
      provider_id: application.provider_id,
      front_image_url: application.front_image_url,
      back_image_url: application.back_image_url,
      verification_status: application.verification_status,
      created_at: application.submitted_at,
      user: {
        id: application.user_id,
        username: "user",
        full_name: "Unknown User",
        email: "",
        avatar_url: null,
      },
      service_type: "provider",
      bio: "Service provider application",
      price: "0",
      location: null,
      availability: null,
    };

    res.json({
      ok: true,
      application: transformedApplication,
    });
  } catch (error) {
    console.error("[PROVIDER APP] Get application error:", error);
    res.status(500).json({
      ok: false,
      error: String(error),
    });
  }
});

export default router;
