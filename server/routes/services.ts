import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  petServiceProviders,
  serviceBookings,
  profiles,
  userServices,
  whelpingProviderRules,
  whelpingWaitlistEntries,
} from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { getServiceVerificationInfo } from "../../shared/serviceVerification";
import { getStripe } from "../lib/stripeLazy";
import {
  createServiceBookingRequestSchema,
  listAvailableSlotsResponseSchema,
} from "../../shared/bookingContract";
import { BOOKING_EVENT_TYPES, BOOKING_SLOT_CONFIG } from "../../shared/bookingCalendarConfig";

const router = Router();

function buildDefaultSlotsForDate(date: string, durationMinutes: number) {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const slots: Array<{ startAt: string; endAt: string; available: boolean }> = [];
  const start = new Date(dayStart);
  start.setUTCHours(BOOKING_SLOT_CONFIG.startHourUtc, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCHours(BOOKING_SLOT_CONFIG.endHourUtc, 0, 0, 0);

  while (start < dayEnd) {
    const end = new Date(start);
    end.setUTCMinutes(end.getUTCMinutes() + durationMinutes);
    if (end > dayEnd) break;
    slots.push({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      available: true,
    });
    start.setUTCMinutes(start.getUTCMinutes() + BOOKING_SLOT_CONFIG.intervalMinutes);
  }
  return slots;
}

// ===== USER ROUTES =====

// POST /api/services/signup - User applies to become service provider
router.post("/signup", authMiddleware, async (req, res) => {
  try {
    const signupSchema = z.object({
      service_type: z.string().min(1, "Service type is required"),
      bio: z.string().min(10, "Bio must be at least 10 characters"),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
      availability: z.string().optional(),
      location: z.string().optional(),
      whelpingRules: z
        .object({
          yearsExperience: z.number().int().min(2),
          hasBreedingLicense: z.literal(true),
          hasSecureWhelpingSpace: z.literal(true),
          theftPreventionPlan: z.string().min(30),
          welfareCommitmentAck: z.literal(true),
          legalComplianceAck: z.literal(true),
          backgroundCheckAck: z.literal(true),
        })
        .optional(),
    });

    const validatedData = signupSchema.parse(req.body);
    if (validatedData.service_type === "whelping" && !validatedData.whelpingRules) {
      return res.status(400).json({
        error: "Whelping applications require strict safety disclosures and acknowledgements",
        code: "whelping_rules_required",
      });
    }

    // Check if user already has a service application
    const existingProvider = await db
      .select()
      .from(petServiceProviders)
      .where(eq(petServiceProviders.user_id, req.user!.id))
      .limit(1);

    if (existingProvider.length > 0) {
      return res.status(400).json({ 
        error: "You already have a service provider application" 
      });
    }

    // Create new service provider application
    const [newProvider] = await db
      .insert(petServiceProviders)
      .values({
        user_id: req.user!.id,
        service_type: validatedData.service_type,
        bio: validatedData.bio,
        price: validatedData.price,
        availability: validatedData.availability,
        location: validatedData.location,
        is_verified: false,
        verification_status: "pending",
      })
      .returning();

    if (validatedData.service_type === "whelping" && validatedData.whelpingRules) {
      await db.insert(whelpingProviderRules).values({
        provider_id: newProvider.id,
        years_experience: validatedData.whelpingRules.yearsExperience,
        has_breeding_license: validatedData.whelpingRules.hasBreedingLicense,
        has_secure_whelping_space: validatedData.whelpingRules.hasSecureWhelpingSpace,
        theft_prevention_plan: validatedData.whelpingRules.theftPreventionPlan,
        welfare_commitment_ack: validatedData.whelpingRules.welfareCommitmentAck,
        legal_compliance_ack: validatedData.whelpingRules.legalComplianceAck,
        background_check_ack: validatedData.whelpingRules.backgroundCheckAck,
      });
    }

    res.status(201).json({
      success: true,
      message: "Service provider application submitted successfully",
      data: newProvider,
    });
  } catch (error) {
    console.error("Error creating service provider application:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// GET /api/services/search - Get verified service providers with filters
router.get("/search", async (req, res) => {
  try {
    const { type, location, min_price, max_price } = req.query;

    const baseQuery = db
      .select({
        id: petServiceProviders.id,
        user_id: petServiceProviders.user_id,
        service_type: petServiceProviders.service_type,
        bio: petServiceProviders.bio,
        price: petServiceProviders.price,
        availability: petServiceProviders.availability,
        location: petServiceProviders.location,
        created_at: petServiceProviders.created_at,
        user: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(petServiceProviders)
      .leftJoin(profiles, eq(petServiceProviders.user_id, profiles.id));

    // Build where conditions
    const conditions = [eq(petServiceProviders.is_verified, true)];
    
    if (type) {
      conditions.push(eq(petServiceProviders.service_type, type as string));
    }

    if (location) {
      conditions.push(sql`${petServiceProviders.location} ILIKE ${`%${location}%`}`);
    }

    if (min_price) {
      conditions.push(sql`${petServiceProviders.price}::numeric >= ${parseFloat(min_price as string)}`);
    }

    if (max_price) {
      conditions.push(sql`${petServiceProviders.price}::numeric <= ${parseFloat(max_price as string)}`);
    }

    const providers = await baseQuery
      .where(and(...conditions))
      .orderBy(petServiceProviders.created_at);

    res.json({
      success: true,
      data: providers,
      count: providers.length,
    });
  } catch (error) {
    console.error("Error searching service providers:", error);
    res.status(500).json({ error: "Failed to search service providers" });
  }
});

// GET /api/services/provider/:id - Get specific provider details
router.get("/provider/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [provider] = await db
      .select({
        id: petServiceProviders.id,
        user_id: petServiceProviders.user_id,
        service_type: petServiceProviders.service_type,
        bio: petServiceProviders.bio,
        price: petServiceProviders.price,
        availability: petServiceProviders.availability,
        location: petServiceProviders.location,
        is_verified: petServiceProviders.is_verified,
        created_at: petServiceProviders.created_at,
        user: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
          verified: profiles.verified,
        },
      })
      .from(petServiceProviders)
      .leftJoin(profiles, eq(petServiceProviders.user_id, profiles.id))
      .where(and(
        eq(petServiceProviders.id, id),
        eq(petServiceProviders.is_verified, true)
      ))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Service provider not found" });
    }

    res.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error("Error fetching service provider:", error);
    res.status(500).json({ error: "Failed to fetch service provider" });
  }
});

// GET /api/services/profile/:userId - Get verified services for a user profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const providers = await db
      .select({
        id: petServiceProviders.id,
        user_id: petServiceProviders.user_id,
        service_type: petServiceProviders.service_type,
        bio: petServiceProviders.bio,
        price: petServiceProviders.price,
        availability: petServiceProviders.availability,
        location: petServiceProviders.location,
        is_verified: petServiceProviders.is_verified,
        verification_status: petServiceProviders.verification_status,
        service_verified: userServices.verified,
        review_status: userServices.review_status,
        created_at: petServiceProviders.created_at,
      })
      .from(petServiceProviders)
      .leftJoin(
        userServices,
        and(
          eq(userServices.user_id, petServiceProviders.user_id),
          eq(userServices.service_type, petServiceProviders.service_type),
        ),
      )
      .where(
        and(
          eq(petServiceProviders.user_id, userId),
        ),
      )
      .orderBy(petServiceProviders.created_at);

    const data = providers.map((p) => {
      const verified = p.service_verified ?? p.is_verified;
      const reviewStatus = p.review_status ?? (verified ? "approved" : "pending");
      return {
        ...p,
        service_verified: Boolean(verified),
        review_status: reviewStatus,
        badge_label: getServiceVerificationInfo(p.service_type).badgeLabel,
      };
    });

    return res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error fetching services profile:", error);
    return res.status(500).json({ error: "Failed to fetch profile services" });
  }
});

// GET /api/services/provider/:providerId/available-slots?date=YYYY-MM-DD&durationMinutes=60
router.get("/provider/:providerId/available-slots", async (req, res) => {
  try {
    const { providerId } = req.params;
    const querySchema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      durationMinutes: z.coerce.number().int().min(30).max(24 * 60).default(60),
    });
    const { date, durationMinutes } = querySchema.parse(req.query);

    const [provider] = await db
      .select({
        id: petServiceProviders.id,
        userId: petServiceProviders.user_id,
        is_verified: petServiceProviders.is_verified,
      })
      .from(petServiceProviders)
      .where(eq(petServiceProviders.id, providerId))
      .limit(1);

    if (!provider || !provider.is_verified) {
      return res.status(404).json({ success: false, code: "provider_not_found", error: "Service provider not found" });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        code: "supabase_unconfigured",
        error: "Calendar service is not configured",
      });
    }

    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;
    console.log(
      "[BOOKING:SLOTS_CHECK]",
      JSON.stringify({ providerId, providerUserId: provider.userId, date, durationMinutes }),
    );
    const { data: dayEvents, error: eventsError } = await supabaseAdmin
      .from("scheduled_events")
      .select("start_time,end_time,status")
      .eq("user_id", provider.userId)
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd);

    if (eventsError) {
      console.error("Error fetching provider calendar events:", eventsError);
      return res.status(500).json({ success: false, code: "internal_error", error: "Failed to load availability" });
    }

    const slots = buildDefaultSlotsForDate(date, durationMinutes).map((slot) => {
      const slotStart = new Date(slot.startAt).getTime();
      const slotEnd = new Date(slot.endAt).getTime();
      const conflict = (dayEvents || []).some((evt: any) => {
        if (evt.status === "cancelled") return false;
        const evtStart = new Date(evt.start_time).getTime();
        const evtEnd = new Date(evt.end_time).getTime();
        return slotStart < evtEnd && slotEnd > evtStart;
      });
      return { ...slot, available: !conflict };
    });

    const payload = {
      success: true as const,
      data: {
        providerId,
        date,
        durationMinutes,
        slots,
      },
    };
    const validatedPayload = listAvailableSlotsResponseSchema.parse(payload);
    console.log(
      "[BOOKING:SLOTS_RESULT]",
      JSON.stringify({
        providerId,
        date,
        durationMinutes,
        total: validatedPayload.data.slots.length,
        available: validatedPayload.data.slots.filter((s) => s.available).length,
      }),
    );
    return res.json(validatedPayload);
  } catch (error) {
    console.error("Error listing available slots:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, code: "validation_error", error: "Validation failed", details: error.errors });
    }
    return res.status(500).json({ success: false, code: "internal_error", error: "Failed to list available slots" });
  }
});

// ===== ADMIN ROUTES =====

// Note: Admin service application routes are now handled by providerApplicationsRouter
// mounted at /api/admin/service-applications in server/routes.ts

// PATCH /api/admin/service-applications/:id - Approve/reject application (Admin only)
router.patch("/admin/service-applications/:id", authMiddleware, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    
    const reviewSchema = z.object({
      status: z.enum(["verified", "rejected"], {
        errorMap: () => ({ message: "Status must be 'verified' or 'rejected'" })
      }),
    });

    const validatedData = reviewSchema.parse(req.body);

    // Update application status
    const [updatedProvider] = await db
      .update(petServiceProviders)
      .set({
        verification_status: validatedData.status,
        is_verified: validatedData.status === "verified",
        updated_at: new Date(),
      })
      .where(eq(petServiceProviders.id, id))
      .returning();

    if (!updatedProvider) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({
      success: true,
      message: `Application ${validatedData.status} successfully`,
      data: updatedProvider,
    });
  } catch (error) {
    console.error("Error updating service application:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Failed to update application" });
  }
});

// ===== BOOKING ROUTES =====

// POST /api/services/book/:providerId - Book a service (unified contract)
router.post("/book/:providerId", authMiddleware, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        code: "supabase_unconfigured",
        error: "Calendar service is not configured",
      });
    }

    const validatedData = createServiceBookingRequestSchema.parse(req.body);
    const providerId = req.params.providerId;

    // Get provider details to calculate price and verify active provider
    const [provider] = await db
      .select()
      .from(petServiceProviders)
      .where(eq(petServiceProviders.id, providerId))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ success: false, code: "provider_not_found", error: "Service provider not found" });
    }

    if (!provider.is_verified) {
      return res.status(404).json({ success: false, code: "provider_not_found", error: "Service provider not found" });
    }

    if (provider.service_type === "whelping") {
      return res.status(403).json({
        success: false,
        code: "application_only",
        error: "Whelping is application-only. Use the waitlist flow with deposit.",
      });
    }

    if (provider.service_type !== validatedData.serviceTypeId) {
      return res.status(400).json({
        success: false,
        code: "validation_error",
        error: "Requested service type does not match provider service type",
      });
    }

    const startAt = new Date(validatedData.startAt);
    const endAt = new Date(startAt);
    endAt.setMinutes(endAt.getMinutes() + validatedData.durationMinutes);

    const { data: overlappingEvents, error: overlapError } = await supabaseAdmin
      .from("scheduled_events")
      .select("id")
      .eq("user_id", provider.user_id)
      .neq("status", "cancelled")
      .lt("start_time", endAt.toISOString())
      .gt("end_time", startAt.toISOString())
      .limit(1);

    if (overlapError) {
      console.error("Error checking booking overlap:", overlapError);
      return res.status(500).json({ success: false, code: "internal_error", error: "Failed to validate availability" });
    }

    console.log(
      "[BOOKING:CONFLICT_CHECK]",
      JSON.stringify({
        providerId,
        providerUserId: provider.user_id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        overlapCount: overlappingEvents?.length ?? 0,
      }),
    );

    if ((overlappingEvents || []).length > 0) {
      return res.status(409).json({
        success: false,
        code: "slot_unavailable",
        error: "Selected slot is no longer available",
      });
    }

    // Calculate total price
    const hourlyRate = parseFloat(provider.price || "0");
    const durationHours = validatedData.durationMinutes / 60;
    const totalPrice = hourlyRate * durationHours;

    // Create booking
    const [newBooking] = await db
      .insert(serviceBookings)
      .values({
        user_id: req.user!.id,
        provider_id: providerId,
        service_date: startAt,
        duration_hours: durationHours.toFixed(2),
        total_price: totalPrice.toString(),
        special_instructions: validatedData.notes,
        status: "pending",
      })
      .returning();

    const { data: createdEvent, error: eventError } = await supabaseAdmin
      .from("scheduled_events")
      .insert({
        title: `Booking hold: ${provider.service_type}`,
        description: JSON.stringify({
          eventType: BOOKING_EVENT_TYPES.bookingHold,
          bookingId: newBooking.id,
          notes: validatedData.notes ?? null,
        }),
        start_time: startAt.toISOString(),
        end_time: endAt.toISOString(),
        user_id: provider.user_id,
        attendee_email: req.user?.email ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (eventError) {
      console.error("Error creating linked scheduled event:", eventError);
      await db.delete(serviceBookings).where(eq(serviceBookings.id, newBooking.id));
      return res.status(500).json({
        success: false,
        code: "internal_error",
        error: "Failed to reserve provider calendar",
      });
    }
    console.log(
      "[BOOKING:CREATED]",
      JSON.stringify({
        bookingId: newBooking.id,
        eventId: createdEvent?.id,
        providerId,
        providerUserId: provider.user_id,
      }),
    );

    res.status(201).json({
      success: true,
      data: {
        bookingId: newBooking.id,
        eventId: createdEvent?.id,
        status: newBooking.status,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        code: "validation_error",
        error: "Validation failed", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ success: false, code: "internal_error", error: "Failed to create booking" });
  }
});

// POST /api/services/whelping/waitlist/:providerId - deposit-backed waitlist application
router.post("/whelping/waitlist/:providerId", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, code: "auth_required", error: "Authentication required" });
    }

    const schema = z.object({
      expectedLitterDate: z.string().datetime().optional(),
      puppyPreference: z.string().max(200).optional(),
      notes: z.string().max(1000).optional(),
      policyAcknowledged: z.literal(true),
    });
    const parsed = schema.parse(req.body);
    const { providerId } = req.params;

    const [provider] = await db
      .select()
      .from(petServiceProviders)
      .where(eq(petServiceProviders.id, providerId))
      .limit(1);

    if (!provider || !provider.is_verified || provider.service_type !== "whelping") {
      return res.status(404).json({
        success: false,
        code: "provider_not_found",
        error: "Whelping provider not found",
      });
    }

    if (provider.user_id === req.user.id) {
      return res.status(400).json({
        success: false,
        code: "invalid_request",
        error: "You cannot join your own waitlist",
      });
    }

    const [existing] = await db
      .select({ id: whelpingWaitlistEntries.id, status: whelpingWaitlistEntries.status })
      .from(whelpingWaitlistEntries)
      .where(
        and(
          eq(whelpingWaitlistEntries.provider_id, providerId),
          eq(whelpingWaitlistEntries.user_id, req.user.id),
        ),
      )
      .limit(1);

    if (existing && existing.status !== "withdrew") {
      return res.status(409).json({
        success: false,
        code: "already_waitlisted",
        error: "You are already on this provider waitlist",
      });
    }

    const deposit = Number(process.env.WHELPING_WAITLIST_DEPOSIT || "100");
    const depositAmount = Number.isFinite(deposit) && deposit > 0 ? deposit : 100;

    const [entry] = await db
      .insert(whelpingWaitlistEntries)
      .values({
        provider_id: providerId,
        user_id: req.user.id,
        expected_litter_date: parsed.expectedLitterDate ? new Date(parsed.expectedLitterDate) : null,
        puppy_preference: parsed.puppyPreference || null,
        notes: parsed.notes || null,
        deposit_amount: depositAmount.toFixed(2),
        policy_acknowledged: parsed.policyAcknowledged,
      })
      .returning();

    const stripe = getStripe();
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const unitAmount = Math.round(depositAmount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Whelping Waitlist Deposit",
              description: "Deposit to join a verified whelping provider waitlist",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/services/provider/${providerId}?waitlist=success`,
      cancel_url: `${baseUrl}/services/provider/${providerId}?waitlist=cancelled`,
      metadata: {
        kind: "whelping_waitlist",
        waitlist_id: entry.id,
        provider_id: providerId,
        user_id: req.user.id,
      },
    });

    await db
      .update(whelpingWaitlistEntries)
      .set({
        stripe_checkout_session_id: session.id,
        updated_at: new Date(),
      })
      .where(eq(whelpingWaitlistEntries.id, entry.id));

    return res.status(201).json({
      success: true,
      data: {
        waitlistId: entry.id,
        depositAmount: depositAmount.toFixed(2),
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating whelping waitlist entry:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        code: "validation_error",
        error: "Validation failed",
        details: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      code: "internal_error",
      error: "Failed to create whelping waitlist entry",
    });
  }
});

// PATCH /api/bookings/:id/status - Update booking status (provider only)
router.patch("/bookings/:id/status", authMiddleware, async (req, res) => {
  try {
    const statusSchema = z.object({
      status: z.enum(["accepted", "rejected", "completed"]),
    });

    const validatedData = statusSchema.parse(req.body);
    const bookingId = req.params.id;

    // Get booking and verify provider ownership
    const [booking] = await db
      .select({
        booking: serviceBookings,
        provider: petServiceProviders,
      })
      .from(serviceBookings)
      .leftJoin(petServiceProviders, eq(serviceBookings.provider_id, petServiceProviders.id))
      .where(eq(serviceBookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ success: false, code: "provider_not_found", error: "Booking not found" });
    }

    if (booking.provider?.user_id !== req.user!.id) {
      return res.status(403).json({ success: false, code: "unauthorized", error: "Not authorized to update this booking" });
    }

    // Update booking status
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ 
        status: validatedData.status,
        updated_at: new Date(),
      })
      .where(eq(serviceBookings.id, bookingId))
      .returning();

    const mappedEventStatus =
      validatedData.status === "accepted"
        ? "confirmed"
        : validatedData.status === "rejected"
          ? "cancelled"
          : "confirmed";

    if (supabaseAdmin) {
      const { error: syncEventError } = await supabaseAdmin
        .from("scheduled_events")
        .update({ status: mappedEventStatus })
        .eq("user_id", booking.provider?.user_id || "")
        .ilike("description", `%\"bookingId\":\"${bookingId}\"%`);

      if (syncEventError) {
        console.error("[BOOKING:SYNC_EVENT_STATUS] failed", syncEventError);
      } else {
        console.log(
          "[BOOKING:SYNC_EVENT_STATUS]",
          JSON.stringify({ bookingId, bookingStatus: validatedData.status, eventStatus: mappedEventStatus }),
        );
      }
    } else {
      console.warn("[BOOKING:SYNC_EVENT_STATUS] skipped — Supabase admin not configured");
    }

    res.json({
      success: true,
      message: `Booking ${validatedData.status} successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        code: "validation_error",
        error: "Validation failed", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ success: false, code: "internal_error", error: "Failed to update booking status" });
  }
});

// GET /api/services/bookings/provider/:userId - Get bookings for provider
router.get("/bookings/provider/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user is requesting their own bookings or is admin
    if (req.user!.id !== userId && !req.user!.is_admin) {
      return res.status(403).json({ success: false, code: "unauthorized", error: "Not authorized" });
    }

    const bookings = await db
      .select({
        id: serviceBookings.id,
        service_date: serviceBookings.service_date,
        duration_hours: serviceBookings.duration_hours,
        total_price: serviceBookings.total_price,
        status: serviceBookings.status,
        special_instructions: serviceBookings.special_instructions,
        created_at: serviceBookings.created_at,
        updated_at: serviceBookings.updated_at,
        user: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
        provider: {
          id: petServiceProviders.id,
          service_type: petServiceProviders.service_type,
        },
      })
      .from(serviceBookings)
      .leftJoin(profiles, eq(serviceBookings.user_id, profiles.id))
      .leftJoin(petServiceProviders, eq(serviceBookings.provider_id, petServiceProviders.id))
      .where(eq(petServiceProviders.user_id, userId))
      .orderBy(sql`${serviceBookings.created_at} DESC`);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    res.status(500).json({ success: false, code: "internal_error", error: "Failed to fetch bookings" });
  }
});

// GET /api/services/bookings/user/:userId - Get bookings by user
router.get("/bookings/user/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user is requesting their own bookings or is admin
    if (req.user!.id !== userId && !req.user!.is_admin) {
      return res.status(403).json({ success: false, code: "unauthorized", error: "Not authorized" });
    }

    const bookings = await db
      .select({
        id: serviceBookings.id,
        service_date: serviceBookings.service_date,
        duration_hours: serviceBookings.duration_hours,
        total_price: serviceBookings.total_price,
        status: serviceBookings.status,
        special_instructions: serviceBookings.special_instructions,
        created_at: serviceBookings.created_at,
        updated_at: serviceBookings.updated_at,
        provider: {
          id: petServiceProviders.id,
          service_type: petServiceProviders.service_type,
          price: petServiceProviders.price,
          location: petServiceProviders.location,
        },
        user: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(serviceBookings)
      .leftJoin(petServiceProviders, eq(serviceBookings.provider_id, petServiceProviders.id))
      .leftJoin(profiles, eq(petServiceProviders.user_id, profiles.id))
      .where(eq(serviceBookings.user_id, userId))
      .orderBy(sql`${serviceBookings.created_at} DESC`);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, code: "internal_error", error: "Failed to fetch bookings" });
  }
});

export default router;