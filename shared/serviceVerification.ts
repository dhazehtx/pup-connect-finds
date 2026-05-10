/**
 * Service verification tiers + per-service requirements and badge copy.
 * LOW = easy checks · MEDIUM = ID + experience · HIGH = facility/legal/health depth.
 */

import type { ServiceCategoryId } from "./serviceCategories";

export type RiskTier = "low" | "medium" | "high";

export type VerificationBadgeVariant =
  | "emerald"
  | "sky"
  | "violet"
  | "orange"
  | "rose"
  | "cyan"
  | "indigo"
  | "slate";

export type ServiceVerificationInfo = {
  riskTier: RiskTier;
  /** Short bullets shown during provider onboarding Step 2 */
  requirements: string[];
  /** Shown on verified listings */
  badgeLabel: string;
  badgeVariant: VerificationBadgeVariant;
};

/**
 * Primary marketplace categories (see `SERVICE_CATEGORIES`).
 */
export const SERVICE_VERIFICATION: Record<ServiceCategoryId, ServiceVerificationInfo> = {
  walking: {
    riskTier: "low",
    requirements: ["Basic info", "Phone / email", "Government ID (optional)"],
    badgeLabel: "Verified Walker",
    badgeVariant: "sky",
  },
  // ——— MEDIUM RISK ———
  sitting: {
    riskTier: "medium",
    requirements: [
      "ID verification",
      "Experience (describe in your bio)",
      "References (optional but recommended)",
    ],
    badgeLabel: "Verified Pet Sitter",
    badgeVariant: "sky",
  },
  training: {
    riskTier: "medium",
    requirements: [
      "ID verification",
      "Experience — credentials or documented background (CPDT, KPA, behavior work, etc.)",
      "References (optional)",
    ],
    badgeLabel: "Certified Trainer",
    badgeVariant: "orange",
  },
  grooming: {
    riskTier: "medium",
    requirements: [
      "ID verification",
      "Experience — salon/mobile setup, certification where applicable",
      "References (optional)",
    ],
    badgeLabel: "Verified Groomer",
    badgeVariant: "violet",
  },

  // ——— LOW RISK ———
  poop_scooping: {
    riskTier: "low",
    requirements: ["Basic info", "Phone / email", "Government ID (optional)"],
    badgeLabel: "Verified Yard Care",
    badgeVariant: "emerald",
  },

  // ——— HIGH RISK ———
  boarding: {
    riskTier: "high",
    requirements: [
      "EIN / business info (or sole-prop documentation where applicable)",
      "Address verification for the boarding facility",
      "Capacity and supervision details (how many dogs, staffing)",
    ],
    badgeLabel: "Verified Boarding Facility",
    badgeVariant: "indigo",
  },
  transportation: {
    riskTier: "high",
    requirements: [
      "Driver’s license verification",
      "Vehicle information matching your listing",
      "Insurance suitable for pet transport (optional for MVP — may be required later)",
    ],
    badgeLabel: "Verified Transporter",
    badgeVariant: "cyan",
  },
  stud_services: {
    riskTier: "high",
    requirements: [
      "Dog health confirmation — testing as represented in your listing (OFA, DNA, etc.)",
      "Pedigree or registration note (optional)",
      "Clear expectations; platform does not guarantee breeding outcomes",
    ],
    badgeLabel: "Verified Stud Provider",
    badgeVariant: "rose",
  },
  whelping: {
    riskTier: "high",
    requirements: [
      "Strict identity and background verification",
      "Breeding/whelping legal compliance documentation",
      "Secure facility + theft prevention plan with emergency protocol",
    ],
    badgeLabel: "Verified Whelping Provider",
    badgeVariant: "rose",
  },
};

const LEGACY_VERIFICATION_FALLBACK: ServiceVerificationInfo = {
  riskTier: "medium",
  requirements: ["Identity verification", "Listing details reviewed for accuracy and safety"],
  badgeLabel: "Verified Provider",
  badgeVariant: "slate",
};

export function getServiceVerificationInfo(
  serviceType: string | null | undefined,
): ServiceVerificationInfo {
  if (!serviceType) return LEGACY_VERIFICATION_FALLBACK;
  const id = serviceType as ServiceCategoryId;
  if (id in SERVICE_VERIFICATION) {
    return SERVICE_VERIFICATION[id];
  }
  return LEGACY_VERIFICATION_FALLBACK;
}

/** UI copy for tier headers (e.g. Step 2 onboarding). */
export function getRiskTierHeading(tier: RiskTier): { title: string; description: string } {
  switch (tier) {
    case "low":
      return {
        title: "Low risk — easy verification",
        description: "Basic contact and profile checks; ID may be optional.",
      };
    case "medium":
      return {
        title: "Medium risk",
        description: "ID verification plus experience; references optional.",
      };
    case "high":
      return {
        title: "High risk — deeper verification",
        description: "Business, facility, vehicle, or health documentation may be required.",
      };
    default:
      return { title: "Verification", description: "" };
  }
}
