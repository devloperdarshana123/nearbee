import { getTrustScore, trustLevelStyles } from "../lib/trustScore";
import type { Provider } from "../lib/types";

export default function TrustBadge({
  provider,
  size = "sm",
}: {
  provider: Provider;
  size?: "sm" | "md";
}) {
  const trust = getTrustScore(provider);
  const styles = trustLevelStyles[trust.level];
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.ring} ${padding}`}
      title={`Trust score ${trust.score}/100 — based on rating, verification, and completed jobs`}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
        <path d="M10 1.5 3 4.5v5.2c0 4.6 3 8.4 7 9.8 4-1.4 7-5.2 7-9.8V4.5L10 1.5Zm0 2.2 5 2.2v3.8c0 3.5-2.2 6.5-5 7.6-2.8-1.1-5-4.1-5-7.6V5.9l5-2.2Z" />
      </svg>
      {trust.label}
    </span>
  );
}
