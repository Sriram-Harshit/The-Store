const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  env: import.meta.env.VITE_ENV || "development",
};

export default config;
