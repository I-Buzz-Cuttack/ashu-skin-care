const API_PREFIX = "/api";
const PRODUCTION_API_ORIGINS = {
  "ashu-skin-care.onrender.com": "https://ashu-skin-care-backend.onrender.com",
};

export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
  const hostFallback = typeof window !== "undefined"
    ? PRODUCTION_API_ORIGINS[window.location.hostname]
    : "";
  const baseUrl = configuredBaseUrl || hostFallback;

  if (!baseUrl) {
    return API_PREFIX;
  }

  // If the base URL already contains /api as a path segment
  // (e.g., https://daktarakhana.in/api/hms or http://localhost:8000/api),
  // return it as-is to avoid double /api prefix.
  if (baseUrl.endsWith(API_PREFIX) || baseUrl.includes(`${API_PREFIX}/`)) {
    return baseUrl;
  }

  return `${baseUrl}${API_PREFIX}`;
};
