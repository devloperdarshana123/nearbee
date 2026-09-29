import { useQuery } from "@tanstack/react-query";
import { getProviderAnalytics } from "../services/analyticsService";

export default function ProviderAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "provider"],
    queryFn: getProviderAnalytics,
    retry: false,
  });

  if (isLoading || !data) {
    return (
      <div className="mb-8 h-40 animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)]" />
    );
  }

  const stats = [
    { label: "Total Bookings", value: data.totalBookings },
    { label: "Completed", value: data.completedBookings },
    { label: "Est. Earnings", value: `₹${data.estimatedEarnings.toLocaleString("en-IN")}` },
    { label: "Avg Rating", value: `★ ${data.avgRating?.toFixed(1) ?? "0.0"}` },
  ];

  const maxBookings = Math.max(1, ...data.monthlyBookings.map((m) => m.bookings));

  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center"
          >
            <p className="text-2xl font-extrabold text-[var(--sea-ink)]">{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Bookings (last 6 months)</p>
        <div className="flex items-end justify-between gap-2" style={{ height: "6rem" }}>
          {data.monthlyBookings.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-8 rounded-t-md bg-[linear-gradient(180deg,var(--lagoon),var(--lagoon-deep))]"
                style={{ height: `${(m.bookings / maxBookings) * 100}%`, minHeight: m.bookings > 0 ? "4px" : "0" }}
                title={`${m.bookings} bookings`}
              />
              <span className="text-xs text-[var(--sea-ink-soft)]">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {data.recentReviews.length > 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">Recent reviews</p>
          <div className="space-y-2">
            {data.recentReviews.map((r) => (
              <div key={r._id} className="border-t border-[var(--line)] pt-2 first:border-none first:pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[var(--sea-ink)]">{r.customerId?.name}</span>
                  <span className="text-[var(--sea-ink-soft)]">★ {r.rating}</span>
                </div>
                {r.comment && <p className="mt-0.5 text-sm text-[var(--sea-ink-soft)]">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
