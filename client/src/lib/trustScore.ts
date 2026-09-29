import type { Provider } from "./types";

export type TrustLevel = "new" | "building" | "trusted" | "highly-trusted";

export interface TrustResult {
  score: number;
  level: TrustLevel;
  label: string;
}

/**
 * A single glanceable reliability signal that blends rating, verification,
 * and track record — more meaningful than a lone star average, since a new
 * profile with one 5-star review looks identical to an established provider
 * under plain ratings alone.
 */
export function getTrustScore(provider: Provider): TrustResult {
  const ratingPoints = (provider.avgRating / 5) * 60;
  const verifiedPoints = provider.isVerified ? 20 : 0;
  const experiencePoints = Math.min(provider.completedBookings, 15) * (20 / 15);
  const score = Math.round(ratingPoints + verifiedPoints + experiencePoints);

  if (provider.reviewCount === 0 && provider.completedBookings === 0) {
    return { score, level: "new", label: "New on NearBee" };
  }
  if (score >= 85) {
    return { score, level: "highly-trusted", label: "Highly Trusted" };
  }
  if (score >= 60) {
    return { score, level: "trusted", label: "Trusted" };
  }
  return { score, level: "building", label: "Building Trust" };
}

export const trustLevelStyles: Record<TrustLevel, { bg: string; text: string; ring: string }> = {
  new: {
    bg: "bg-[color-mix(in_oklab,var(--sea-ink-soft)_14%,transparent)]",
    text: "text-[var(--sea-ink-soft)]",
    ring: "ring-[var(--line)]",
  },
  building: {
    bg: "bg-[color-mix(in_oklab,var(--lagoon)_16%,transparent)]",
    text: "text-[var(--lagoon-deep)]",
    ring: "ring-[color-mix(in_oklab,var(--lagoon)_35%,transparent)]",
  },
  trusted: {
    bg: "bg-[color-mix(in_oklab,var(--palm)_18%,transparent)]",
    text: "text-[var(--palm)]",
    ring: "ring-[color-mix(in_oklab,var(--palm)_35%,transparent)]",
  },
  "highly-trusted": {
    bg: "bg-[linear-gradient(135deg,var(--lagoon),var(--palm))]",
    text: "text-white",
    ring: "ring-[color-mix(in_oklab,var(--palm)_45%,transparent)]",
  },
};
