import axios from "axios";

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

// Set by <AuthTokenSync> once Clerk's useAuth().getToken is available, since
// there's no window.Clerk global in @clerk/tanstack-react-start to pull from
// outside of React (unlike classic @clerk/clerk-react apps).
export function setTokenGetter(getter: TokenGetter | null) {
  tokenGetter = getter;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const ASSET_BASE = API_BASE.replace(/\/api\/?$/, "");
export const resolveAssetUrl = (path?: string) =>
  !path ? "" : path.startsWith("http") ? path : `${ASSET_BASE}${path}`;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenGetter?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
