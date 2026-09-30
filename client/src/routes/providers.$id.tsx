import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/tanstack-react-start";
import { getProviderById, getAvailableSlots, getPriceEstimate } from "../services/providerService";
import { getReviewsForProvider, reportReview } from "../services/reviewService";
import { createBooking } from "../services/bookingService";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import TrustBadge from "../components/TrustBadge";
import FavoriteButton from "../components/FavoriteButton";
import TrustScoreCard from "../components/TrustScoreCard";
import { resolveAssetUrl } from "../lib/api";

export const Route = createFileRoute("/providers/$id")({ component: ProviderDetailPage });

function ProviderDetailPage() {
  const { id } = Route.useParams();
  const { isSignedIn } = useUser();
  const { user } = useMarketplaceAuth();
  const queryClient = useQueryClient();

  const { data: providerData, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => getProviderById(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReviewsForProvider(id),
  });

  const [form, setForm] = useState({ serviceDescription: "", requestedDate: "", requestedTime: "" });
  const [confirmation, setConfirmation] = useState("");
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const { data: slotsData } = useQuery({
    queryKey: ["availability", id, form.requestedDate],
    queryFn: () => getAvailableSlots(id, form.requestedDate),
    enabled: !!form.requestedDate,
  });

  const { data: priceEstimate } = useQuery({
    queryKey: ["price-estimate", providerData?.provider.category, providerData?.provider.location?.city],
    queryFn: () =>
      getPriceEstimate(providerData!.provider.category, providerData!.provider.location?.city),
    enabled: !!providerData?.provider,
  });

  const reportMutation = useMutation({
    mutationFn: (id: string) => reportReview(id),
    onSuccess: (_, id) => setReportedIds((prev) => [...prev, id]),
  });

  const bookingMutation = useMutation({
    mutationFn: (data: typeof form) => createBooking({ providerId: id, ...data }),
    onSuccess: () => {
      setConfirmation("Booking request sent!");
      setForm({ serviceDescription: "", requestedDate: "", requestedTime: "" });
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "requestedDate") {
      setForm((f) => ({ ...f, requestedDate: value, requestedTime: "" }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmation("");
    bookingMutation.mutate(form);
  };

  if (isLoading) {
    return <p className="page-wrap px-6 py-16 text-center text-[var(--sea-ink-soft)]">Loading...</p>;
  }

  const provider = providerData?.provider;
  if (!provider) {
    return (
      <p className="page-wrap px-6 py-16 text-center text-[var(--sea-ink-soft)]">
        Provider not found.
      </p>
    );
  }

  return (
    <div className="page-wrap px-6 py-12">
      <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_40px_rgba(23,58,64,0.06)] sm:p-8">
        <div className="absolute right-6 top-6">
          <FavoriteButton providerId={provider._id} />
        </div>
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <img
            src={provider.profilePhoto ? resolveAssetUrl(provider.profilePhoto) : "https://placehold.co/96x96"}
            alt={provider.userId?.name}
            className="h-24 w-24 flex-shrink-0 rounded-2xl bg-[var(--chip-line)] object-cover"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
              {provider.userId?.name}
            </h1>
            <p className="mt-0.5 text-[var(--sea-ink-soft)]">{provider.category}</p>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
              {provider.location?.city}
              {provider.location?.area ? `, ${provider.location.area}` : ""} · ★{" "}
              {provider.avgRating?.toFixed(1) ?? "0.0"} ({provider.reviewCount ?? 0}) · ₹
              {provider.priceRange?.min}-₹{provider.priceRange?.max}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TrustBadge provider={provider} size="md" />
              {provider.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--palm)_16%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--palm)]">
                  ✓ Verified provider
                </span>
              )}
            </div>
          </div>
        </div>

        {provider.bio && (
          <p className="mt-6 border-t border-[var(--line)] pt-6 text-[var(--sea-ink-soft)]">
            {provider.bio}
          </p>
        )}

        {!!provider.workPhotos?.length && (
          <div className="mt-6 border-t border-[var(--line)] pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Work gallery
            </h2>
            <div className="flex flex-wrap gap-3">
              {provider.workPhotos.map((p) => (
                <img
                  key={p}
                  src={resolveAssetUrl(p)}
                  alt="Work sample"
                  className="h-28 w-28 rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <TrustScoreCard provider={provider} />
      </div>

      {isSignedIn && user?.role === "customer" && (
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="mb-1 text-lg font-semibold text-[var(--sea-ink)]">Request a booking</h2>
          {priceEstimate && priceEstimate.min != null && (
            <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
              💡 Typical price for {provider.category.toLowerCase()}
              {priceEstimate.scope === "city" ? ` in ${provider.location?.city}` : ""}: ₹
              {priceEstimate.min}-₹{priceEstimate.max}{" "}
              <span className="text-xs">(based on {priceEstimate.count} providers)</span>
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea
              name="serviceDescription"
              placeholder="Describe what you need"
              value={form.serviceDescription}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
            />
            <div className="flex gap-3">
              <input
                name="requestedDate"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.requestedDate}
                onChange={handleChange}
                required
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
              />
              {slotsData?.hasScheduledAvailability ? (
                <select
                  name="requestedTime"
                  value={form.requestedTime}
                  onChange={handleChange}
                  required
                  className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
                >
                  <option value="" disabled>
                    {slotsData.slots.length ? "Select a time" : "No slots this day"}
                  </option>
                  {slotsData.slots.map((s) => (
                    <option key={s.time} value={s.time} disabled={!s.available}>
                      {s.time} {s.available ? "" : "(booked)"}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="requestedTime"
                  type="time"
                  value={form.requestedTime}
                  onChange={handleChange}
                  required
                  className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
                />
              )}
            </div>
            {bookingMutation.isError && (
              <p className="text-sm text-red-600">
                {(bookingMutation.error as any)?.response?.data?.message || "Booking failed"}
              </p>
            )}
            {confirmation && <p className="text-sm text-[var(--palm)]">{confirmation}</p>}
            <button
              type="submit"
              disabled={bookingMutation.isPending}
              className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {bookingMutation.isPending ? "Sending..." : "Request booking"}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--sea-ink)]">Reviews</h2>
        {reviewsData?.reviews.length === 0 && (
          <p className="text-sm text-[var(--sea-ink-soft)]">No reviews yet.</p>
        )}
        <div className="space-y-3">
          {reviewsData?.reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--sea-ink)]">
                  {review.customerId?.name}
                </span>
                <span className="text-sm text-[var(--sea-ink-soft)]">★ {review.rating}</span>
              </div>
              {review.comment && (
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{review.comment}</p>
              )}
              {!!review.photos?.length && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {review.photos.map((p) => (
                    <img
                      key={p}
                      src={resolveAssetUrl(p)}
                      alt="Review"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              {isSignedIn && (
                <button
                  onClick={() => reportMutation.mutate(review._id)}
                  disabled={reportedIds.includes(review._id) || reportMutation.isPending}
                  className="mt-2 text-xs font-medium text-[var(--sea-ink-soft)] underline disabled:no-underline"
                >
                  {reportedIds.includes(review._id) ? "Reported" : "Report"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
