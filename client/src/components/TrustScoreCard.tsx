import { getTrustScore, trustLevelStyles } from "../lib/trustScore";
import type { Provider } from "../lib/types";

export default function TrustScoreCard({ provider }: { provider: Provider }) {
  const trust = getTrustScore(provider);
  const styles = trustLevelStyles[trust.level];

  const breakdown = [
    { label: "Rating", value: Math.round((provider.avgRating / 5) * 60), max: 60 },
    { label: "Verification", value: provider.isVerified ? 20 : 0, max: 20 },
    { label: "Track record", value: Math.round(Math.min(provider.completedBookings, 15) * (20 / 15)), max: 20 },
  ];

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--sea-ink)]">Trust Score</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.bg} ${styles.text}`}>
          {trust.score}/100 · {trust.label}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {breakdown.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex justify-between text-xs text-[var(--sea-ink-soft)]">
              <span>{b.label}</span>
              <span>
                {b.value}/{b.max}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--chip-line)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--lagoon),var(--lagoon-deep))]"
                style={{ width: `${(b.value / b.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[var(--sea-ink-soft)]">
        Trust Score blends customer ratings, identity verification, and completed jobs into one
        signal — more meaningful than a star rating alone.
      </p>
    </div>
  );
}
