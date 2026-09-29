import api from "../lib/api";
import type { Provider } from "../lib/types";

export interface SmartSearchInterpretation {
  category?: string | null;
  city?: string | null;
  state?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export const smartSearchProviders = (query: string) =>
  api
    .post<{ providers: Provider[]; interpreted: SmartSearchInterpretation }>(
      "/providers/smart-search",
      { query },
    )
    .then((res) => res.data);
