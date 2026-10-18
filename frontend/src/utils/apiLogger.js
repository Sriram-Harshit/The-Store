import axios from "axios";

/**
 * Configure global Axios interceptors for structured logging and strict error monitoring
 */
export const setupAxiosInterceptors = () => {
  // Request Interceptor
  axios.interceptors.request.use(
    (requestConfig) => {
      // Attach JWT token from localStorage if present and not already set
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed?.token && !requestConfig.headers.Authorization) {
            requestConfig.headers.Authorization = `Bearer ${parsed.token}`;
          }
        }
      } catch {
        // Ignore JSON parse errors
      }

      const timestamp = new Date().toLocaleTimeString();
      console.log(`[HTTP ${timestamp}] 🚀 ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
      return requestConfig;
    },
    (error) => {
      console.error("[HTTP Request Setup Error]:", error);
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const timestamp = new Date().toLocaleTimeString();
      const status = error.response?.status;
      const url = error.config?.url;
      const message = error.response?.data?.message || error.response?.data?.error || error.message;

      if (status === 401) {
        console.warn(`[HTTP ${timestamp}] ⚠️ 401 Unauthorized: Session invalid or missing credentials for ${url}`);
      } else if (status === 403) {
        console.warn(`[HTTP ${timestamp}] 🚫 403 Forbidden: Role permission denied for ${url}. Details:`, message);
      } else if (status >= 500) {
        console.error(`[HTTP ${timestamp}] 🔴 5xx Server Error on ${url}:`, message);
      } else {
        console.error(`[HTTP ${timestamp}] ❌ API Error (${status}) on ${url}:`, message);
      }

      return Promise.reject(error);
    }
  );
};
