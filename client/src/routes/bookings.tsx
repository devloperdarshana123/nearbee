import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyBookings, updateBookingStatus } from "../services/bookingService";
import { createReview } from "../services/reviewService";
import { uploadFile } from "../services/uploadService";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import ProtectedRoute from "../components/ProtectedRoute";
import EmptyState from "../components/EmptyState";
import BookingChat from "../components/BookingChat";
import { resolveAssetUrl } from "../lib/api";
import type { BookingStatus } from "../lib/types";

export const Route = createFileRoute("/bookings")({
  component: () => (
    <ProtectedRoute>
      <MyBookingsPage />
    </ProtectedRoute>
  ),
});

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-[color-mix(in_oklab,var(--lagoon)_18%,transparent)] text-[var(--lagoon-deep)]",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-[color-mix(in_oklab,var(--palm)_18%,transparent)] text-[var(--palm)]",
};

function ReviewForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createReview({ bookingId, rating, comment, photos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
      onDone();
    },
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - photos.length);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadFile(f)));
      setPhotos((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--sea-ink-soft)]">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
      />
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--sea-ink-soft)]">
          Add photos (optional, up to 5)
        </label>
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <img
              key={p}
              src={resolveAssetUrl(p)}
              alt="Review"
              className="h-14 w-14 rounded-lg object-cover"
            />
          ))}
          {photos.length < 5 && (
            <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--chip-line)] text-xs text-[var(--sea-ink-soft)]">
              {uploading ? "…" : "+ Add"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-600">
          {(mutation.error as any)?.response?.data?.message || "Failed to submit review"}
        </p>
      )}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || uploading}
        className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-4 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        {mutation.isPending ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}

function MyBookingsPage() {
  const { user } = useMarketplaceAuth();
  const queryClient = useQueryClient();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [chattingId, setChattingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "my"],
    queryFn: getMyBookings,
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings", "my"] }),
  });

  const bookings = data?.bookings ?? [];

  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">
          My Bookings
        </h1>

        {isLoading && <p className="text-[var(--sea-ink-soft)]">Loading...</p>}

        {!isLoading && bookings.length === 0 && (
          <EmptyState
            icon={<span className="text-xl">📅</span>}
            title="No bookings yet"
            message="Once you request or receive a booking, it will show up here."
          />
        )}

        <div className="space-y-4">
          {bookings.map((booking) => {
            const otherParty =
              user?.role === "provider" ? booking.customerId?.name : booking.providerId?.userId?.name;

            return (
              <div
                key={booking._id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--sea-ink)]">{otherParty}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{booking.serviceDescription}</p>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  {new Date(booking.requestedDate).toLocaleDateString()} at {booking.requestedTime}
                </p>

                <button
                  onClick={() => setChattingId(chattingId === booking._id ? null : booking._id)}
                  className="mt-2 text-sm font-semibold text-[var(--lagoon-deep)] underline"
                >
                  {chattingId === booking._id ? "Hide chat" : "💬 Message"}
                </button>
                {chattingId === booking._id && <BookingChat bookingId={booking._id} />}

                {user?.role === "provider" && booking.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => statusMutation.mutate({ id: booking._id, status: "accepted" })}
                      className="rounded-full bg-[var(--lagoon-deep)] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: booking._id, status: "rejected" })}
                      className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {user?.role === "provider" && booking.status === "accepted" && (
                  <div className="mt-3">
                    <button
                      onClick={() => statusMutation.mutate({ id: booking._id, status: "completed" })}
                      className="rounded-full bg-[var(--palm)] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Mark as completed
                    </button>
                  </div>
                )}

                {user?.role === "customer" && booking.status === "completed" && (
                  <div className="mt-3">
                    {reviewingId === booking._id ? (
                      <ReviewForm bookingId={booking._id} onDone={() => setReviewingId(null)} />
                    ) : (
                      <button
                        onClick={() => setReviewingId(booking._id)}
                        className="text-sm font-semibold text-[var(--lagoon-deep)] underline"
                      >
                        Leave a review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
