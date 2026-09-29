import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProviders } from "../services/providerService";
import { smartSearchProviders, type SmartSearchInterpretation } from "../services/smartSearchService";
import TrustBadge from "./TrustBadge";
import FavoriteButton from "./FavoriteButton";
import ProviderCardSkeleton from "./ProviderCardSkeleton";
import EmptyState from "./EmptyState";
import { getAllCountries, getStatesOfCountry } from "../lib/locations";
import type { Provider } from "../lib/types";

const countries = getAllCountries();

export const CATEGORIES = [
  { label: "Plumber", emoji: "🔧" },
  { label: "Electrician", emoji: "💡" },
  { label: "Carpenter", emoji: "🪚" },
  { label: "Painter", emoji: "🎨" },
  { label: "AC Repair", emoji: "❄️" },
  { label: "Appliance Repair", emoji: "🔌" },
  { label: "Pest Control", emoji: "🐜" },
  { label: "Gardener", emoji: "🌳" },
  { label: "Locksmith", emoji: "🔑" },
  { label: "Cleaner", emoji: "🧹" },
  { label: "Deep Cleaning", emoji: "🧽" },
  { label: "Laundry", emoji: "👕" },
  { label: "Beautician", emoji: "💇" },
  { label: "Massage Therapist", emoji: "💆" },
  { label: "Yoga Instructor", emoji: "🧘" },
  { label: "Personal Trainer", emoji: "🏋️" },
  { label: "Babysitter", emoji: "🍼" },
  { label: "Nanny", emoji: "🧒" },
  { label: "Elderly Care", emoji: "🧓" },
  { label: "Pet Sitter", emoji: "🐕" },
  { label: "Tutor", emoji: "📚" },
  { label: "Music Teacher", emoji: "🎵" },
  { label: "Cook", emoji: "🍳" },
  { label: "Caterer", emoji: "🍽️" },
  { label: "Driver", emoji: "🚗" },
  { label: "Movers & Packers", emoji: "📦" },
  { label: "Photographer", emoji: "📷" },
  { label: "Event Decorator", emoji: "🎉" },
  { label: "Mobile Repair", emoji: "📱" },
  { label: "Tailor", emoji: "🧵" },
];

const DEFAULT_VISIBLE_CATEGORIES = 12;

export default function ProviderSearch({
  initialCategory = "",
  showHero = true,
}: {
  initialCategory?: string;
  showHero?: boolean;
}) {
  const [filters, setFilters] = useState({
    category: initialCategory,
    countryCode: "",
    stateCode: "",
    city: "",
    minPrice: "",
    maxPrice: "",
  });
  const [page, setPage] = useState(1);
  const [near, setNear] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const findNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNear(`${pos.coords.latitude},${pos.coords.longitude}`);
        setPage(1);
        setLocating(false);
      },
      () => {
        setLocationError("Couldn't get your location. Check location permission.");
        setLocating(false);
      },
    );
  };
  const [showAllCategories, setShowAllCategories] = useState(
    () => !!initialCategory && !CATEGORIES.slice(0, DEFAULT_VISIBLE_CATEGORIES).some((c) => c.label === initialCategory),
  );

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiResult, setAiResult] = useState<{
    providers: Awaited<ReturnType<typeof smartSearchProviders>>["providers"];
    interpreted: SmartSearchInterpretation;
  } | null>(null);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const result = await smartSearchProviders(aiQuery.trim());
      setAiResult(result);
    } catch {
      setAiError(true);
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiQuery("");
    setAiResult(null);
    setAiError(false);
  };

  const states = filters.countryCode ? getStatesOfCountry(filters.countryCode) : [];

  const queryParams = {
    category: filters.category,
    country: countries.find((c) => c.isoCode === filters.countryCode)?.name ?? "",
    state: states.find((s) => s.isoCode === filters.stateCode)?.name ?? "",
    city: filters.city,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    near,
    page,
    limit: 12,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["providers", queryParams],
    queryFn: () =>
      getProviders(Object.fromEntries(Object.entries(queryParams).filter(([, v]) => v !== ""))),
  });

  const filterKey = JSON.stringify({ ...filters, near });
  const [accumulated, setAccumulated] = useState<Provider[]>([]);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);

  useEffect(() => {
    if (!data) return;
    if (filterKey !== lastFilterKey) {
      setAccumulated(data.providers);
      setLastFilterKey(filterKey);
    } else if (page === 1) {
      setAccumulated(data.providers);
    } else {
      setAccumulated((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...data.providers.filter((p) => !seen.has(p._id))];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPage(1);
    if (name === "countryCode") {
      setFilters((f) => ({ ...f, countryCode: value, stateCode: "", city: "" }));
      return;
    }
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div>
      {showHero && (
        <section className="page-wrap px-6 pb-10 pt-14 text-center sm:pt-20">
          <p className="mx-auto mb-3 inline-block rounded-full bg-[color-mix(in_oklab,var(--lagoon)_14%,transparent)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--lagoon-deep)]">
            Trusted local help, near you
          </p>
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--sea-ink)] sm:text-5xl">
            Find a service provider you can actually trust
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
            No more digging through WhatsApp groups. Search, compare Trust Scores, and book local
            plumbers, electricians, tutors, and more in minutes.
          </p>
        </section>
      )}

      <section className={`page-wrap px-6 ${showHero ? "" : "pt-10"} pb-6 text-center`}>
        <form
          onSubmit={handleAiSearch}
          className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--surface-strong)] p-1.5 pl-4 shadow-[0_18px_40px_rgba(23,58,64,0.08)]"
        >
          <span aria-hidden="true">✨</span>
          <input
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Try: “I need a plumber in Delhi under ₹1000”"
            className="flex-1 border-none bg-transparent py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="flex-shrink-0 rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {aiLoading ? "Searching…" : "AI Search"}
          </button>
        </form>
      </section>

      {aiResult && (
        <section className="page-wrap px-6 pb-6 text-center">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm text-[var(--sea-ink-soft)]">
            <span>
              Understood as:{" "}
              {[aiResult.interpreted.category, aiResult.interpreted.city, aiResult.interpreted.state]
                .filter(Boolean)
                .join(", ") || "no specific filters"}
              {aiResult.interpreted.maxPrice ? ` · under ₹${aiResult.interpreted.maxPrice}` : ""}
            </span>
            <button
              type="button"
              onClick={clearAiSearch}
              className="rounded-full border border-[var(--chip-line)] px-3 py-1 font-medium text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)]"
            >
              Clear AI search
            </button>
          </div>
        </section>
      )}

      {aiError && (
        <section className="page-wrap px-6 pb-6 text-center">
          <p className="text-sm text-red-600">AI search is unavailable right now. Please try the filters below.</p>
        </section>
      )}

      <section className={`page-wrap px-6 ${aiResult ? "hidden" : ""} pb-10 text-center`}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-3 text-left shadow-[0_18px_40px_rgba(23,58,64,0.08)] sm:grid-cols-3 lg:grid-cols-6">
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          >
            <option value="">Any category</option>
            {CATEGORIES.map((c) => (
              <option key={c.label} value={c.label}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
          <select
            name="countryCode"
            value={filters.countryCode}
            onChange={handleChange}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          >
            <option value="">Any country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <select
            name="stateCode"
            value={filters.stateCode}
            onChange={handleChange}
            disabled={!filters.countryCode}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          >
            <option value="">Any state</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleChange}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          />
          <input
            name="minPrice"
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={handleChange}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          />
          <input
            name="maxPrice"
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={handleChange}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          />
        </div>

        <div className="mx-auto mt-3 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={findNearMe}
            disabled={locating}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              near
                ? "border-transparent bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] text-white"
                : "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            }`}
          >
            📍 {locating ? "Locating…" : near ? "Sorted by distance" : "Near me"}
          </button>
          {near && (
            <button
              type="button"
              onClick={() => {
                setNear("");
                setPage(1);
              }}
              className="rounded-full border border-dashed border-[var(--chip-line)] px-3.5 py-1.5 text-sm font-medium text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)]"
            >
              Clear
            </button>
          )}
          {locationError && <span className="text-sm text-red-600">{locationError}</span>}
        </div>

        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
          {(showAllCategories ? CATEGORIES : CATEGORIES.slice(0, DEFAULT_VISIBLE_CATEGORIES)).map(
            (c) => {
              const active = filters.category === c.label;
              const chipClass = `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium no-underline transition ${
                active
                  ? "border-transparent bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] text-white shadow-[0_8px_18px_rgba(50,143,151,0.32)]"
                  : "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              }`;
              return active ? (
                <Link key={c.label} to="/" className={chipClass}>
                  <span>{c.emoji}</span>
                  {c.label}
                </Link>
              ) : (
                <Link key={c.label} to="/category/$name" params={{ name: c.label }} className={chipClass}>
                  <span>{c.emoji}</span>
                  {c.label}
                </Link>
              );
            },
          )}
          <button
            type="button"
            onClick={() => setShowAllCategories((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--chip-line)] px-3.5 py-1.5 text-sm font-medium text-[var(--lagoon-deep)] transition hover:bg-[var(--chip-bg)]"
          >
            {showAllCategories ? "Show less" : `+${CATEGORIES.length - DEFAULT_VISIBLE_CATEGORIES} more`}
          </button>
        </div>
      </section>

      {/* Results */}
      <section className="page-wrap px-6 pb-16">
        {!aiResult && isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!aiResult && isError && !isLoading && (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
              </svg>
            }
            title="Couldn't load providers"
            message="Something went wrong reaching the server. Check your connection and try again."
            action={
              <button
                onClick={() => refetch()}
                className="rounded-full bg-[var(--sea-ink)] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Try again
              </button>
            }
          />
        )}

        {aiResult && aiResult.providers.length === 0 && (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" strokeLinecap="round" />
                <path strokeLinecap="round" d="m20 20-3.2-3.2" />
              </svg>
            }
            title="No providers match your AI search"
            message="Try rephrasing your request, or use the filters below instead."
            action={
              <button
                onClick={clearAiSearch}
                className="rounded-full bg-[var(--sea-ink)] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Clear AI search
              </button>
            }
          />
        )}

        {!aiResult && !isLoading && !isError && accumulated.length === 0 && (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" strokeLinecap="round" />
                <path strokeLinecap="round" d="m20 20-3.2-3.2" />
              </svg>
            }
            title={hasActiveFilters ? "No providers match your search" : "No providers yet"}
            message={
              hasActiveFilters
                ? "Try a different category, city, or widen your price range."
                : "Be the first provider on NearBee — check back soon or become a provider yourself."
            }
            action={
              hasActiveFilters ? (
                <button
                  onClick={() => {
                    setPage(1);
                    setNear("");
                    setFilters({
                      category: "",
                      countryCode: "",
                      stateCode: "",
                      city: "",
                      minPrice: "",
                      maxPrice: "",
                    });
                  }}
                  className="rounded-full bg-[var(--sea-ink)] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        )}

        {(aiResult ? aiResult.providers.length > 0 : !isLoading && !isError && accumulated.length > 0) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {(aiResult ? aiResult.providers : accumulated).map((provider) => (
              <Link
                key={provider._id}
                to="/providers/$id"
                params={{ id: provider._id }}
                className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 no-underline transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(23,58,64,0.12)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={provider.profilePhoto || "https://placehold.co/48x48"}
                    alt={provider.userId?.name}
                    className="h-12 w-12 rounded-full bg-[var(--chip-line)] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--sea-ink)]">
                      {provider.userId?.name}
                    </p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">{provider.category}</p>
                  </div>
                  <FavoriteButton providerId={provider._id} />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-[var(--sea-ink-soft)]">
                  <span className="truncate">
                    {provider.location?.city}
                    {provider.location?.area ? `, ${provider.location.area}` : ""}
                  </span>
                  <span className="flex flex-shrink-0 items-center gap-1 font-medium text-[var(--sea-ink)]">
                    ★ {provider.avgRating?.toFixed(1) ?? "0.0"}
                    <span className="text-[var(--sea-ink-soft)]">({provider.reviewCount ?? 0})</span>
                  </span>
                </div>

                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  ₹{provider.priceRange?.min} - ₹{provider.priceRange?.max}
                </p>

                <div className="mt-3">
                  <TrustBadge provider={provider} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!aiResult && !isLoading && !isError && data && data.totalPages > data.page && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
