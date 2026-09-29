import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Show } from "@clerk/tanstack-react-start";
import { getMyFavorites, addFavorite, removeFavorite } from "../services/favoriteService";

export default function FavoriteButton({ providerId }: { providerId: string }) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["favorites", "mine"],
    queryFn: getMyFavorites,
    retry: false,
  });

  const isFavorited = data?.favorites.some((p) => p._id === providerId) ?? false;

  const addMutation = useMutation({
    mutationFn: () => addFavorite(providerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", "mine"] }),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFavorite(providerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", "mine"] }),
  });

  const isPending = addMutation.isPending || removeMutation.isPending;

  return (
    <Show when="signed-in">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isFavorited) removeMutation.mutate();
          else addMutation.mutate();
        }}
        disabled={isPending}
        aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
        aria-pressed={isFavorited}
        className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-lg transition disabled:opacity-50 ${
          isFavorited
            ? "border-transparent bg-[color-mix(in_oklab,var(--lagoon)_18%,transparent)] text-[var(--lagoon-deep)]"
            : "border-[var(--chip-line)] bg-[var(--surface)] text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)]"
        }`}
      >
        {isFavorited ? "♥" : "♡"}
      </button>
    </Show>
  );
}
