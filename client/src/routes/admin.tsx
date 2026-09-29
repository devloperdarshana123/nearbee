import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  banUser,
  getAllBookings,
  setProviderVerification,
  getPendingVerifications,
  getFlaggedReviews,
  deleteReview,
} from "../services/adminService";
import { getProviders } from "../services/providerService";
import ProtectedRoute from "../components/ProtectedRoute";
import { resolveAssetUrl } from "../lib/api";

export const Route = createFileRoute("/admin")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminPage />
    </ProtectedRoute>
  ),
});

const tabs = ["Users", "Providers", "Bookings", "Verifications", "Flagged Reviews"] as const;
type Tab = (typeof tabs)[number];

function AdminPage() {
  const [tab, setTab] = useState<Tab>("Users");
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => getUsers(),
    enabled: tab === "Users",
  });

  const providersQuery = useQuery({
    queryKey: ["admin", "providers"],
    queryFn: () => getProviders(),
    enabled: tab === "Providers",
  });

  const bookingsQuery = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => getAllBookings(),
    enabled: tab === "Bookings",
  });

  const verificationsQuery = useQuery({
    queryKey: ["admin", "verifications"],
    queryFn: () => getPendingVerifications(),
    enabled: tab === "Verifications",
  });

  const flaggedReviewsQuery = useQuery({
    queryKey: ["admin", "flagged-reviews"],
    queryFn: () => getFlaggedReviews(),
    enabled: tab === "Flagged Reviews",
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "flagged-reviews"] }),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => banUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      setProviderVerification(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "providers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
    },
  });

  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">Admin</h1>

        <div className="mb-6 flex gap-2 border-b border-[var(--line)]">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? "border-b-2 border-[var(--lagoon-deep)] text-[var(--sea-ink)]"
                  : "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Users" && (
          <div className="space-y-2">
            {usersQuery.data?.users.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
              >
                <div>
                  <p className="font-semibold text-[var(--sea-ink)]">{u.name}</p>
                  <p className="text-sm text-[var(--sea-ink-soft)]">
                    {u.email} · {u.role} {u.isBanned && "· banned"}
                  </p>
                </div>
                {!u.isBanned && u.role !== "admin" && (
                  <button
                    onClick={() => banMutation.mutate(u._id)}
                    className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Ban
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "Providers" && (
          <div className="space-y-2">
            {providersQuery.data?.providers.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
              >
                <div>
                  <p className="font-semibold text-[var(--sea-ink)]">{p.userId?.name}</p>
                  <p className="text-sm text-[var(--sea-ink-soft)]">
                    {p.category} · {p.location?.city} {p.isVerified && "· verified"}
                  </p>
                </div>
                <button
                  onClick={() => verifyMutation.mutate({ id: p._id, isVerified: !p.isVerified })}
                  className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {p.isVerified ? "Unverify" : "Verify"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "Bookings" && (
          <div className="space-y-2">
            {bookingsQuery.data?.bookings.map((b) => (
              <div key={b._id} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="font-semibold text-[var(--sea-ink)]">
                  {b.customerId?.name} → {b.providerId?.userId?.name}
                </p>
                <p className="text-sm text-[var(--sea-ink-soft)]">
                  {b.serviceDescription} · {b.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "Verifications" && (
          <div className="space-y-2">
            {verificationsQuery.data?.providers.length === 0 && (
              <p className="text-sm text-[var(--sea-ink-soft)]">No pending verification requests.</p>
            )}
            {verificationsQuery.data?.providers.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--sea-ink)]">{p.userId?.name}</p>
                  <p className="text-sm text-[var(--sea-ink-soft)]">
                    {p.category} · {p.location?.city}
                  </p>
                  {p.verificationDocument && (
                    <a
                      href={resolveAssetUrl(p.verificationDocument)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[var(--lagoon-deep)] underline"
                    >
                      View document
                    </a>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    onClick={() => verifyMutation.mutate({ id: p._id, isVerified: true })}
                    className="rounded-full bg-[var(--palm)] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => verifyMutation.mutate({ id: p._id, isVerified: false })}
                    className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Flagged Reviews" && (
          <div className="space-y-2">
            {flaggedReviewsQuery.data?.reviews.length === 0 && (
              <p className="text-sm text-[var(--sea-ink-soft)]">No flagged reviews.</p>
            )}
            {flaggedReviewsQuery.data?.reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--sea-ink)]">
                    {r.customerId?.name} · ★ {r.rating}
                  </p>
                  <button
                    onClick={() => deleteReviewMutation.mutate(r._id)}
                    className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Delete review
                  </button>
                </div>
                {r.comment && <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{r.comment}</p>}
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">Reason: {r.flagReason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
