import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { reviews, profiles, serviceBookings } from '@shared/schema';

const ELIGIBLE_BOOKING_STATUSES = ['accepted', 'completed'] as const;

const createProviderReviewBody = z.object({
  provider_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(5000).optional().nullable(),
});

async function syncProviderRatingAggregate(providerId: string) {
  const [agg] = await db
    .select({
      avgRating: sql<string>`coalesce(avg(${reviews.rating})::numeric, 0)`,
      cnt: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.reviewee_id, providerId));

  const avg = Number(agg?.avgRating ?? 0);
  const cnt = Number(agg?.cnt ?? 0);
  await db
    .update(profiles)
    .set({
      rating: Math.round(avg * 10) / 10 >= 0 ? Math.round(avg) : 0,
      total_reviews: cnt,
    })
    .where(eq(profiles.id, providerId));
}

export async function getProviderReviewsHandler(req: Request, res: Response) {
  try {
    const providerId = req.params.providerId;
    if (!z.string().uuid().safeParse(providerId).success) {
      return res.status(400).json({ error: 'Invalid provider id' });
    }

    const rows = await db
      .select({
        id: reviews.id,
        user_id: reviews.reviewer_id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        reviewer_full_name: profiles.full_name,
        reviewer_username: profiles.username,
        reviewer_avatar_url: profiles.avatar_url,
      })
      .from(reviews)
      .innerJoin(profiles, eq(reviews.reviewer_id, profiles.id))
      .where(eq(reviews.reviewee_id, providerId))
      .orderBy(desc(reviews.created_at));

    const [agg] = await db
      .select({
        avgRating: sql<string>`coalesce(avg(${reviews.rating})::numeric, 0)`,
        reviewCount: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.reviewee_id, providerId));

    const averageRating = Math.round(Number(agg?.avgRating ?? 0) * 10) / 10;
    const reviewCount = Number(agg?.reviewCount ?? 0);

    return res.json({
      success: true,
      averageRating,
      reviewCount,
      reviews: rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        reviewer: {
          full_name: r.reviewer_full_name,
          username: r.reviewer_username,
          avatar_url: r.reviewer_avatar_url,
        },
      })),
    });
  } catch (e) {
    console.error('[PROVIDER_REVIEWS] GET failed', e);
    return res.status(500).json({ error: 'Failed to load provider reviews' });
  }
}

export async function postProviderReviewHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parsed = createProviderReviewBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const { provider_id, booking_id, rating, comment } = parsed.data;

    if (provider_id === userId) {
      return res.status(400).json({ error: 'You cannot review your own profile' });
    }

    const [booking] = await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.id, booking_id))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'You can only review bookings you made' });
    }

    if (booking.provider_id !== provider_id) {
      return res.status(400).json({ error: 'Booking does not match this provider' });
    }

    if (!ELIGIBLE_BOOKING_STATUSES.includes(booking.status as (typeof ELIGIBLE_BOOKING_STATUSES)[number])) {
      return res.status(400).json({
        error: 'You can only review after the booking is accepted or completed',
        code: 'BOOKING_NOT_ELIGIBLE',
      });
    }

    const [providerProfile] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, provider_id)).limit(1);
    if (!providerProfile) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    try {
      const [inserted] = await db
        .insert(reviews)
        .values({
          reviewer_id: userId,
          reviewee_id: provider_id,
          rating,
          comment: comment ?? null,
        })
        .returning();

      await syncProviderRatingAggregate(provider_id);

      return res.status(201).json({ success: true, data: inserted });
    } catch (insertErr: any) {
      throw insertErr;
    }
  } catch (e) {
    console.error('[PROVIDER_REVIEWS] POST failed', e);
    return res.status(500).json({ error: 'Failed to create review' });
  }
}

/** Eligible bookings for the current user to review this provider (no review yet). */
export async function getEligibleBookingsForReviewHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const providerId = req.params.providerId;
    if (!z.string().uuid().safeParse(providerId).success) {
      return res.status(400).json({ error: 'Invalid provider id' });
    }

    const userBookings = await db
      .select({
        id: serviceBookings.id,
        service_date: serviceBookings.service_date,
        status: serviceBookings.status,
      })
      .from(serviceBookings)
      .where(
        and(
          eq(serviceBookings.user_id, userId),
          eq(serviceBookings.provider_id, providerId),
          inArray(serviceBookings.status, [...ELIGIBLE_BOOKING_STATUSES]),
        ),
      )
      .orderBy(desc(serviceBookings.created_at));

    if (userBookings.length === 0) {
      return res.json({ eligible: [] });
    }

    const eligible = userBookings.map((b) => ({
      id: b.id,
      booking_date: new Date(b.service_date).toISOString().slice(0, 10),
      booking_time: new Date(b.service_date).toISOString().slice(11, 16),
      status: b.status,
    }));

    return res.json({ eligible });
  } catch (e) {
    console.error('[PROVIDER_REVIEWS] eligible failed', e);
    return res.status(500).json({ error: 'Failed to load eligible bookings' });
  }
}
