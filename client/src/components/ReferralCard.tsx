import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReferralStats } from "../services/authService";

export default function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const { data } = useQuery({
    queryKey: ["referral", "stats"],
    queryFn: getReferralStats,
    retry: false,
  });

  if (!data) return null;

  const link = `${window.location.origin}/?ref=${data.referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available, ignore
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
      <h2 className="text-lg font-bold text-[var(--sea-ink)]">Refer & Earn</h2>
      <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
        Share your link with friends. You've referred{" "}
        <span className="font-semibold text-[var(--lagoon-deep)]">{data.referralCount}</span>{" "}
        {data.referralCount === 1 ? "person" : "people"} so far.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 truncate rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
