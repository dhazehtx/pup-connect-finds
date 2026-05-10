/**
 * Single source of truth for pet service provider categories (`pet_service_providers.service_type`).
 * Stored as lowercase snake_case in the database.
 */

/**
 * Primary provider types (Step 1 — “What service do you offer?”).
 * Order: walking → sitting → boarding → grooming → training → poop → stud → transport.
 */
export const SERVICE_CATEGORIES = [
  { id: "walking", label: "Dog Walking", pillEmoji: "🚶" },
  { id: "sitting", label: "Dog Sitting", pillEmoji: "🏠" },
  { id: "boarding", label: "Boarding", pillEmoji: "🏨" },
  { id: "grooming", label: "Grooming", pillEmoji: "🧼" },
  { id: "training", label: "Training", pillEmoji: "🎯" },
  { id: "poop_scooping", label: "Poop Scooping", pillEmoji: "🧹" },
  { id: "stud_services", label: "Stud Services", pillEmoji: "🐕" },
  { id: "whelping", label: "Whelping Care", pillEmoji: "🍼" },
  { id: "transportation", label: "Transportation", pillEmoji: "🚗" },
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORIES)[number]["id"];

export const SERVICE_CATEGORY_IDS: ServiceCategoryId[] = SERVICE_CATEGORIES.map((c) => c.id);

/** Older rows may still use these; keep valid for reads and filters. */
export const LEGACY_SERVICE_CATEGORY_IDS = ["veterinary", "mobile_grooming"] as const;

export type LegacyServiceCategoryId = (typeof LEGACY_SERVICE_CATEGORY_IDS)[number];

export const ALLOWED_PET_SERVICE_TYPES = [
  ...SERVICE_CATEGORY_IDS,
  ...LEGACY_SERVICE_CATEGORY_IDS,
] as const;

export type AllowedPetServiceType = (typeof ALLOWED_PET_SERVICE_TYPES)[number];

export function isAllowedPetServiceType(value: string): value is AllowedPetServiceType {
  return (ALLOWED_PET_SERVICE_TYPES as readonly string[]).includes(value);
}

export function getServiceCategoryLabel(id: string | null | undefined): string {
  if (!id) return "Service";
  const row = SERVICE_CATEGORIES.find((c) => c.id === id);
  if (row) return row.label;
  if (id === "veterinary") return "Veterinary Care";
  if (id === "mobile_grooming") return "Mobile Grooming";
  return id.replace(/_/g, " ");
}

export function getServiceCategoryEmoji(id: string | null | undefined): string {
  if (!id) return "🐕";
  const row = SERVICE_CATEGORIES.find((c) => c.id === id);
  if (row) return row.pillEmoji;
  if (id === "veterinary") return "🏥";
  if (id === "mobile_grooming") return "🚐";
  return "🐕";
}

/** Display label for `pet_service_providers.transport_type`. */
export function formatTransportType(t: string | null | undefined): string {
  if (!t) return "";
  const m = t.toLowerCase();
  if (m === "local_pickup") return "Local pickup";
  if (m === "long_distance") return "Long distance";
  if (m === "airport") return "Airport transport";
  return t.replace(/_/g, " ");
}

/** Display label for `pet_service_providers.stud_method` (live | shipped | both). */
export function formatStudMethod(method: string | null | undefined): string {
  if (!method) return "";
  const m = method.toLowerCase();
  if (m === "live") return "Live";
  if (m === "shipped") return "Shipped";
  if (m === "both") return "Live & shipped";
  return method.replace(/_/g, " ");
}

/** Filters / marketplace pills: canonical categories plus legacy ids still in DB */
export const SERVICE_CATEGORY_FILTER_OPTIONS = [
  ...SERVICE_CATEGORIES,
  { id: "veterinary" as const, label: "Veterinary Care", pillEmoji: "🏥" },
  { id: "mobile_grooming" as const, label: "Mobile Grooming", pillEmoji: "🚐" },
] as const;
