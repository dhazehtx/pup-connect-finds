import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { notificationService } from "../services/notificationService";
import { db } from "../db";
import { providerApplications, profiles } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { requireAdmin, requireStrictAdmin } from "../middleware/requireAdmin";

const router = Router();

// Submit provider application (Step 7 of onboarding)
router.post("/submit", requireAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        ok: false,
        error: "Supabase is not configured",
      });
    }

    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({
        ok: false,
        error: "Provider ID is required",
      });
    }

    // Server-authoritative applicant identity — never trust a client-supplied userId.
    const userId = (req as any).user!.id;

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

// Admin review endpoint (uses supabaseAdmin) — server-side admin authorization required
router.post("/review", requireStrictAdmin, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        ok: false,
        error: "Supabase admin is not configured",
      });
    }

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
      })
      .eq("id", applicationId)
      .eq("status", "submitted") // Prevent race conditions - only update if still submitted
      .select("id, user_id, provider_id, status, verification_status, submitted_at, front_image_url, back_image_url")
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
        const updatedProfile = await storage.updateProfile(application.user_id, { verified: true });

        if (!updatedProfile) {
          console.error(
            "[PROVIDER APP] Failed to update profile for user:",
            application.user_id,
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

// Get applications for admin (uses supabaseAdmin for secure access) — admin only
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    // Build query using Drizzle ORM with LEFT JOIN to profiles table
    const baseQuery = db
      .select({
        // Application fields
        id: providerApplications.id,
        user_id: providerApplications.user_id,
        provider_id: providerApplications.provider_id,
        status: providerApplications.status,
        verification_status: providerApplications.verification_status,
        submitted_at: providerApplications.submitted_at,
        front_image_url: providerApplications.front_image_url,
        back_image_url: providerApplications.back_image_url,
        // User profile fields
        username: profiles.username,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
      })
      .from(providerApplications)
      .leftJoin(profiles, eq(providerApplications.user_id, profiles.id));

    // Add status filter if requested and execute query with ordering
    const results = status === "pending"
      ? await baseQuery
          .where(
            and(
              eq(providerApplications.status, "submitted"),
              eq(providerApplications.verification_status, "pending")
            )
          )
          .orderBy(desc(providerApplications.submitted_at))
      : await baseQuery.orderBy(desc(providerApplications.submitted_at));

    console.log(`[PROVIDER APP] Found ${results.length} applications`);

    // Transform data to match frontend expectations
    const transformedData = results.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      provider_id: row.provider_id,
      front_image_url: row.front_image_url,
      back_image_url: row.back_image_url,
      verification_status: row.verification_status,
      status: row.status,
      created_at: row.submitted_at,
      // User data from joined profiles table
      user: {
        id: row.user_id,
        username: row.username || "user",
        full_name: row.full_name || "Unknown User",
        avatar_url: row.avatar_url,
      },
      // Add placeholder fields that the frontend expects
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

// Get detailed application by ID (admin only) — exposes signed ID-doc URLs
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch application with user profile data using JOIN
    const result = await db
      .select({
        // Application fields
        id: providerApplications.id,
        user_id: providerApplications.user_id,
        provider_id: providerApplications.provider_id,
        status: providerApplications.status,
        verification_status: providerApplications.verification_status,
        submitted_at: providerApplications.submitted_at,
        front_image_url: providerApplications.front_image_url,
        back_image_url: providerApplications.back_image_url,
        bgcheck_consent: providerApplications.bgcheck_consent,
        bgcheck_status: providerApplications.bgcheck_status,
        reviewed_at: providerApplications.reviewed_at,
        review_notes: providerApplications.review_notes,
        // User profile fields
        username: profiles.username,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
        bio: profiles.bio,
        phone: profiles.phone,
        address: profiles.address,
        city: profiles.city,
        state: profiles.state,
        zip_code: profiles.zip_code,
      })
      .from(providerApplications)
      .leftJoin(profiles, eq(providerApplications.user_id, profiles.id))
      .where(eq(providerApplications.id, id))
      .limit(1);

    if (!result || result.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found",
      });
    }

    const application = result[0];

    // Build location string from address components
    const locationParts = [application.city, application.state, application.zip_code].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : null;

    // Fetch provider details from Supabase if provider_id exists
    let providerDetails = null;
    if (application.provider_id) {
      try {
        if (supabaseAdmin) {
          const { data: provider } = await supabaseAdmin
            .from("providers")
            .select("*")
            .eq("id", application.provider_id)
            .single();

          providerDetails = provider;
        }
      } catch (err) {
        console.error("[PROVIDER APP] Error fetching provider details:", err);
      }
    }

    // Generate signed URLs for ID photos if they exist
    let frontImageSignedUrl = null;
    let backImageSignedUrl = null;

    if (application.front_image_url) {
      try {
        if (supabaseAdmin) {
          const { data: signedData } = await supabaseAdmin.storage
            .from("provider-id-docs")
            .createSignedUrl(application.front_image_url, 3600); // 1 hour expiry

          frontImageSignedUrl = signedData?.signedUrl || application.front_image_url;
        } else {
          frontImageSignedUrl = application.front_image_url;
        }
      } catch (err) {
        console.error("[PROVIDER APP] Error generating signed URL for front image:", err);
        frontImageSignedUrl = application.front_image_url;
      }
    }

    if (application.back_image_url) {
      try {
        if (supabaseAdmin) {
          const { data: signedData } = await supabaseAdmin.storage
            .from("provider-id-docs")
            .createSignedUrl(application.back_image_url, 3600); // 1 hour expiry

          backImageSignedUrl = signedData?.signedUrl || application.back_image_url;
        } else {
          backImageSignedUrl = application.back_image_url;
        }
      } catch (err) {
        console.error("[PROVIDER APP] Error generating signed URL for back image:", err);
        backImageSignedUrl = application.back_image_url;
      }
    }

    // Return detailed application data
    res.json({
      ok: true,
      data: {
        id: application.id,
        user_id: application.user_id,
        provider_id: application.provider_id,
        status: application.status,
        verification_status: application.verification_status,
        submitted_at: application.submitted_at,
        reviewed_at: application.reviewed_at,
        review_notes: application.review_notes,
        bgcheck_consent: application.bgcheck_consent,
        bgcheck_status: application.bgcheck_status,
        // User profile
        user: {
          id: application.user_id,
          username: application.username || "user",
          full_name: application.full_name || "Unknown User",
          avatar_url: application.avatar_url,
          bio: application.bio,
          phone: application.phone,
          location: location,
        },
        // Provider details (if exists)
        provider: providerDetails,
        // ID document images with signed URLs
        front_image_url: frontImageSignedUrl,
        back_image_url: backImageSignedUrl,
      },
    });
  } catch (error) {
    console.error("[PROVIDER APP] Error fetching application details:", error);
    res.status(500).json({
      ok: false,
      error: String(error),
    });
  }
});

// PATCH endpoint for approve/reject (admin only) — server-side admin authorization required
router.patch("/:id", requireStrictAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = (req as any).user?.id; // Get admin ID from auth middleware

    if (!status || !["verified", "rejected", "approved"].includes(status)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid status. Must be 'verified', 'approved', or 'rejected'",
      });
    }

    // Map 'verified' to 'approved' for consistency
    const dbStatus = status === "verified" ? "approved" : status;

    console.log(
      `[PROVIDER APP] Admin ${adminId} updating application ${id} to status: ${dbStatus}`,
    );

    // First, check if application exists and is in submitted state
    const existing = await db
      .select()
      .from(providerApplications)
      .where(
        and(
          eq(providerApplications.id, id),
          eq(providerApplications.status, "submitted")
        )
      )
      .limit(1);

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Application not found or already reviewed",
      });
    }

    // Update application with review metadata using Drizzle
    const updated = await db
      .update(providerApplications)
      .set({
        status: dbStatus,
        verification_status: dbStatus,
        reviewed_at: new Date(),
        reviewed_by: adminId || null,
        review_notes: notes || null,
      })
      .where(eq(providerApplications.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return res.status(500).json({
        ok: false,
        error: "Failed to update application",
      });
    }

    const application = updated[0];
    console.log("[PROVIDER APP] Application updated:", application);

    // Update provider status if approved (with error handling)
    if (dbStatus === "approved" && application.provider_id) {
      try {
        if (!supabaseAdmin) {
          return res.status(503).json({
            ok: false,
            error: "Supabase admin is not configured; cannot verify provider.",
          });
        }
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
        const updatedProfile = await storage.updateProfile(application.user_id, { verified: true });

        if (!updatedProfile) {
          console.error(
            "[PROVIDER APP] Failed to update profile for user:",
            application.user_id,
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

export default router;
