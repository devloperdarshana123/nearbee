import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProviders,
  createProviderProfile,
  updateProviderProfile,
  submitVerificationDocument,
  type AvailabilitySlot,
} from "../services/providerService";
import { uploadFile } from "../services/uploadService";
import { resolveAssetUrl } from "../lib/api";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import ProtectedRoute from "../components/ProtectedRoute";
import { CATEGORIES } from "../components/ProviderSearch";
import ProviderAnalytics from "../components/ProviderAnalytics";
import {
  DEFAULT_COUNTRY_CODE,
  getAllCountries,
  getCountryByName,
  getStateByNameAndCountry,
  getStatesOfCountry,
} from "../lib/locations";

export const Route = createFileRoute("/provider/dashboard")({
  component: () => (
    <ProtectedRoute>
      <ProviderDashboardPage />
    </ProtectedRoute>
  ),
});

const emptyForm = {
  category: "",
  bio: "",
  countryCode: DEFAULT_COUNTRY_CODE,
  stateCode: "",
  city: "",
  area: "",
  minPrice: "",
  maxPrice: "",
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
};

const countries = getAllCountries();

const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm";

function ProviderDashboardPage() {
  const { user, setRole, isSettingRole, roleError } = useMarketplaceAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const isProvider = user?.role === "provider";

  // There's no "get my provider profile" endpoint, so we search the public list for our own profile.
  const { data, isLoading } = useQuery({
    queryKey: ["providers", "mine"],
    queryFn: () => getProviders(),
    select: (result) => result.providers.find((p) => p.userId?._id === user?.id),
    enabled: isProvider,
  });

  useEffect(() => {
    if (data) {
      const countryCode =
        getCountryByName(data.location?.country ?? "")?.isoCode ?? DEFAULT_COUNTRY_CODE;
      const stateCode =
        getStateByNameAndCountry(data.location?.state ?? "", countryCode)?.isoCode ?? "";
      setForm({
        category: data.category || "",
        bio: data.bio || "",
        countryCode,
        stateCode,
        city: data.location?.city || "",
        area: data.location?.area || "",
        minPrice: String(data.priceRange?.min ?? ""),
        maxPrice: String(data.priceRange?.max ?? ""),
        lat: (data.location as any)?.geo?.coordinates?.[1],
        lng: (data.location as any)?.geo?.coordinates?.[0],
      });
      setAvailability(data.availability ?? []);
      setProfilePhoto(data.profilePhoto || "");
      setWorkPhotos(data.workPhotos ?? []);
    }
  }, [data]);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { url } = await uploadFile(file);
      setProfilePhoto(url);
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleWorkPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 10 - workPhotos.length);
    if (files.length === 0) return;
    setPhotoUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadFile(f)));
      setWorkPhotos((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const removeWorkPhoto = (url: string) => {
    setWorkPhotos((prev) => prev.filter((p) => p !== url));
  };

  const states = getStatesOfCountry(form.countryCode);

  const toPayload = () => {
    const country = countries.find((c) => c.isoCode === form.countryCode)?.name ?? "";
    const state = states.find((s) => s.isoCode === form.stateCode)?.name ?? "";
    return {
      category: form.category,
      bio: form.bio,
      location: { country, state, city: form.city, area: form.area, lat: form.lat, lng: form.lng },
      priceRange: { min: Number(form.minPrice), max: Number(form.maxPrice) },
      availability,
      profilePhoto,
      workPhotos,
    };
  };

  const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const addAvailabilitySlot = () => {
    setAvailability((prev) => [...prev, { day: "Monday", startTime: "09:00", endTime: "17:00" }]);
  };

  const updateAvailabilitySlot = (index: number, patch: Partial<AvailabilitySlot>) => {
    setAvailability((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const [verificationUploading, setVerificationUploading] = useState(false);
  const verificationMutation = useMutation({
    mutationFn: (documentUrl: string) => submitVerificationDocument(data!._id, documentUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers", "mine"] }),
  });

  const handleVerificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerificationUploading(true);
    try {
      const { url } = await uploadFile(file);
      await verificationMutation.mutateAsync(url);
    } finally {
      setVerificationUploading(false);
      e.target.value = "";
    }
  };

  const [locating, setLocating] = useState(false);
  const setMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocating(false);
      },
      () => setLocating(false),
    );
  };

  const createMutation = useMutation({
    mutationFn: () => createProviderProfile(toPayload()),
    onSuccess: () => {
      setSaved("Profile created!");
      queryClient.invalidateQueries({ queryKey: ["providers", "mine"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProviderProfile(data!._id, toPayload()),
    onSuccess: () => {
      setSaved("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["providers", "mine"] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSaved("");
    if (name === "countryCode") {
      setForm((f) => ({ ...f, countryCode: value, stateCode: "", city: "" }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved("");
    if (data) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const mutation = data ? updateMutation : createMutation;

  if (!isProvider) {
    return (
      <div className="page-wrap px-6 py-16 text-center">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">
          Become a service provider
        </h1>
        <p className="mx-auto mb-6 max-w-sm text-[var(--sea-ink-soft)]">
          Switch your account to a provider account to create a profile and start receiving
          bookings.
        </p>
        {roleError && (
          <p className="mb-3 text-sm text-red-600">
            {roleError.response?.data?.message || "Failed to switch account type"}
          </p>
        )}
        <button
          onClick={() => setRole("provider")}
          disabled={isSettingRole}
          className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isSettingRole ? "Switching..." : "Become a provider"}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <p className="page-wrap px-6 py-16 text-center text-[var(--sea-ink-soft)]">Loading...</p>;
  }

  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-xl">
        {data && <ProviderAnalytics />}

        {data && !data.isVerified && (
          <div className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="mb-1 text-lg font-semibold text-[var(--sea-ink)]">Get verified</h2>
            <p className="mb-3 text-sm text-[var(--sea-ink-soft)]">
              Upload a government ID or business proof so our team can verify your profile and show
              the verified badge to customers.
            </p>
            {data.verificationStatus === "pending" && (
              <p className="text-sm font-medium text-amber-600">
                ⏳ Document submitted — pending admin review.
              </p>
            )}
            {data.verificationStatus === "rejected" && (
              <p className="mb-2 text-sm font-medium text-red-600">
                Your last submission wasn't approved. Please upload a clearer document.
              </p>
            )}
            {data.verificationStatus !== "pending" && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-[var(--chip-line)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)]">
                {verificationUploading ? "Uploading..." : "📄 Upload verification document"}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleVerificationUpload}
                  disabled={verificationUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">
          {data ? "Edit your provider profile" : "Create your provider profile"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Category
            </label>
            <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Bio
            </label>
            <textarea
              name="bio"
              placeholder="Tell customers about your experience"
              value={form.bio}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                Country
              </label>
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                required
                className={inputClass}
              >
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                State
              </label>
              <select
                name="stateCode"
                value={form.stateCode}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Select a state
                </option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                City
              </label>
              <input
                name="city"
                placeholder="e.g. Pune"
                value={form.city}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                Area
              </label>
              <input
                name="area"
                placeholder="e.g. Kothrud"
                value={form.area}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={setMyLocation}
              disabled={locating}
              className="text-sm font-semibold text-[var(--lagoon-deep)] underline disabled:opacity-50"
            >
              {locating ? "Locating…" : form.lat ? "📍 Location set — update" : "📍 Set my exact location"}
            </button>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Lets customers find you with "Near me" search.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                Min price (₹)
              </label>
              <input
                name="minPrice"
                type="number"
                value={form.minPrice}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
                Max price (₹)
              </label>
              <input
                name="maxPrice"
                type="number"
                value={form.maxPrice}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Profile photo
            </label>
            <div className="flex items-center gap-3">
              <img
                src={profilePhoto ? resolveAssetUrl(profilePhoto) : "https://placehold.co/64x64"}
                alt="Profile"
                className="h-16 w-16 rounded-xl bg-[var(--chip-line)] object-cover"
              />
              <label className="cursor-pointer rounded-full border border-dashed border-[var(--chip-line)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)]">
                {photoUploading ? "Uploading..." : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  disabled={photoUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Before/After work gallery
            </label>
            <p className="mb-2 text-xs text-[var(--sea-ink-soft)]">
              Show off your best work — customers trust providers with a visible portfolio.
            </p>
            <div className="flex flex-wrap gap-2">
              {workPhotos.map((p) => (
                <div key={p} className="group relative">
                  <img
                    src={resolveAssetUrl(p)}
                    alt="Work"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeWorkPhoto(p)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {workPhotos.length < 10 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--chip-line)] text-xs text-[var(--sea-ink-soft)]">
                  {photoUploading ? "…" : "+ Add"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleWorkPhotosUpload}
                    disabled={photoUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Weekly availability
            </label>
            <p className="mb-2 text-xs text-[var(--sea-ink-soft)]">
              Customers will see live time slots based on this when booking you.
            </p>
            <div className="space-y-2">
              {availability.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={slot.day}
                    onChange={(e) => updateAvailabilitySlot(i, { day: e.target.value })}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1.5 text-sm"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateAvailabilitySlot(i, { startTime: e.target.value })}
                    className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-[var(--sea-ink-soft)]">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateAvailabilitySlot(i, { endTime: e.target.value })}
                    className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeAvailabilitySlot(i)}
                    className="flex-shrink-0 text-red-600"
                    aria-label="Remove slot"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAvailabilitySlot}
              className="mt-2 text-sm font-semibold text-[var(--lagoon-deep)] underline"
            >
              + Add time slot
            </button>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">
              {(mutation.error as any)?.response?.data?.message || "Failed to save profile"}
            </p>
          )}
          {saved && <p className="text-sm text-[var(--palm)]">{saved}</p>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : data ? "Save changes" : "Create profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
