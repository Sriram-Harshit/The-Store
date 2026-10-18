const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? "http://localhost:5000/api"
    : "https://the-store-backend-rosy.vercel.app");

const config = {
  apiUrl: rawApiUrl.replace(/\/+$/, ""),
  env: import.meta.env.VITE_ENV || (isLocalhost ? "development" : "production"),
};

export default config;
