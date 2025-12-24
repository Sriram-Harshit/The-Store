const config = {
  apiUrl:
    import.meta.env.VITE_API_URL ||
    "https://the-store-backend-rosy.vercel.app" ||
    "http://localhost:5000",
  env: import.meta.env.VITE_ENV || "development",
};

export default config;
