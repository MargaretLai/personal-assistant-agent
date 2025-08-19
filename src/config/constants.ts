// In your frontend config/constants
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://backend-production-a611.up.railway.app/api/v1"
    : "http://127.0.0.1:8000/api/v1";
