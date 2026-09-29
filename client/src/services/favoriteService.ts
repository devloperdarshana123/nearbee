import api from "../lib/api";
import type { Provider } from "../lib/types";

export const getMyFavorites = () =>
  api.get<{ favorites: Provider[] }>("/favorites").then((res) => res.data);

export const addFavorite = (providerId: string) =>
  api.post("/favorites", { providerId }).then((res) => res.data);

export const removeFavorite = (providerId: string) =>
  api.delete(`/favorites/${providerId}`).then((res) => res.data);
