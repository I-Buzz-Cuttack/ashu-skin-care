import axios from "axios";
import { getToken, removeToken, setToken } from "../utils/tokenService";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

// const apiClient = axios.create({
//   baseURL: getApiBaseUrl(),
//   timeout: 10000,
// });

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const unwrapAuth = (response) => {
  const body = response?.data;
  return body?.result ?? body?.data ?? body;
};

// ✅ Attach token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    if (status === 401 && originalRequest && !originalRequest._retry && !url.includes("/auth/login") && !url.includes("/auth/refresh")) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshClient.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
        const data = unwrapAuth(await refreshPromise);
        const token = data.accessToken || data.token;
        if (!token) throw new Error("Refresh response did not include an access token");
        setToken(token);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeToken();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
