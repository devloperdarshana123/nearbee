import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyFavorites } from "../services/favoriteService";
import TrustBadge from "../components/TrustBadge";
import FavoriteButton from "../components/FavoriteButton";
import EmptyState from "../components/EmptyState";
import ProtectedRoute from "../components/ProtectedRoute";

export const Route = createFileRoute("/favorites")({
  component: () => (
    <ProtectedRoute>
      <FavoritesPage />
    </ProtectedRoute>
  ),
});

function FavoritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["favorites", "mine"],
    queryFn: getMyFavorites,
    retry: false,
  });

  const favorites = data?.favorites ?? [];

  return (
    <div className="page-wrap px-6 py-12">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">
        Saved Providers
      </h1>

      {isLoading && <p className="text-[var(--sea-ink-soft)]">Loading...</p>}

      {!isLoading && favorites.length === 0 && (
        <EmptyState
          icon={<span className="text-xl">♡</span>}
          title="No saved providers yet"
          message="Tap the heart icon on a provider's card to save them here for later."
          action={
            <Link
              to="/"
              className="rounded-full bg-[var(--sea-ink)] px-5 py-2 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5"
            >
              Find Providers
            </Link>
          }
        />
      )}

      {!isLoading && favorites.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {favorites.map((provider) => (
            <div
              key={provider._id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <Link
                to="/providers/$id"
                params={{ id: provider._id }}
                className="block no-underline"
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
                </div>
                <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
                  {provider.location?.city}
                  {provider.location?.area ? `, ${provider.location.area}` : ""}
                </p>
                <div className="mt-3">
                  <TrustBadge provider={provider} />
                </div>
              </Link>
              <div className="mt-3 flex justify-end">
                <FavoriteButton providerId={provider._id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
