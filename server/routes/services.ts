import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { petServiceProviders, serviceBookings, profiles } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = Router();

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
    });

    const validatedData = signupSchema.parse(req.body);

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

    let query = db
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
      .leftJoin(profiles, eq(petServiceProviders.user_id, profiles.id))
      .where(eq(petServiceProviders.is_verified, true));

    // Apply filters
    const conditions = [eq(petServiceProviders.is_verified, true)];

    if (type) {
      conditions.push(eq(petServiceProviders.service_type, type as string));
    }

    if (location) {
      conditions.push(
        sql`${petServiceProviders.location} ILIKE ${`%${location}%`}`
      );
    }

    if (min_price) {
      conditions.push(
        sql`${petServiceProviders.price}::numeric >= ${parseFloat(min_price as string)}`
      );
    }

    if (max_price) {
      conditions.push(
        sql`${petServiceProviders.price}::numeric <= ${parseFloat(max_price as string)}`
      );
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const providers = await query.orderBy(petServiceProviders.created_at);

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

// POST /api/services/book/:providerId - Create booking request
router.post("/book/:providerId", authMiddleware, async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const bookingSchema = z.object({
      service_date: z.string().datetime("Invalid date format"),
      duration_hours: z.number().min(0.5, "Minimum 30 minutes").max(24, "Maximum 24 hours"),
      special_instructions: z.string().optional(),
    });

    const validatedData = bookingSchema.parse(req.body);

    // Verify provider exists and is verified
    const [provider] = await db
      .select()
      .from(petServiceProviders)
      .where(and(
        eq(petServiceProviders.id, providerId),
        eq(petServiceProviders.is_verified, true)
      ))
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Service provider not found" });
    }

    // Calculate total price
    const hourlyRate = parseFloat(provider.price);
    const totalPrice = hourlyRate * validatedData.duration_hours;

    // Create booking request
    const [newBooking] = await db
      .insert(serviceBookings)
      .values({
        provider_id: providerId,
        user_id: req.user!.id,
        service_date: new Date(validatedData.service_date),
        duration_hours: validatedData.duration_hours.toString(),
        total_price: totalPrice.toString(),
        special_instructions: validatedData.special_instructions,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      data: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// ===== ADMIN ROUTES =====

// GET /api/admin/service-applications - Get pending applications (Admin only)
router.get("/admin/service-applications", authMiddleware, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const applications = await db
      .select({
        id: petServiceProviders.id,
        user_id: petServiceProviders.user_id,
        service_type: petServiceProviders.service_type,
        bio: petServiceProviders.bio,
        price: petServiceProviders.price,
        availability: petServiceProviders.availability,
        location: petServiceProviders.location,
        verification_status: petServiceProviders.verification_status,
        created_at: petServiceProviders.created_at,
        user: {
          id: profiles.id,
          username: profiles.username,
          full_name: profiles.full_name,
          email: profiles.email,
          avatar_url: profiles.avatar_url,
        },
      })
      .from(petServiceProviders)
      .leftJoin(profiles, eq(petServiceProviders.user_id, profiles.id))
      .where(eq(petServiceProviders.verification_status, "pending"))
      .orderBy(petServiceProviders.created_at);

    res.json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("Error fetching service applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

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

export default router;