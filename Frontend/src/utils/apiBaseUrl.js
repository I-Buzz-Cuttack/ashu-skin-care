const API_PREFIX = "/api";

export const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

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
