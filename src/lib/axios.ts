import axios from "axios";
import { BASEURL } from "./base";

const axiosInstance = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Logout endpoint call failed, but continue with redirect
      }

      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "";
      const loginUrl = pathname.includes("/mentalhealth-professionals")
        ? "/mentalhealth-professionals/login"
        : "/login";

      if (typeof window !== "undefined") {
        window.location.href = loginUrl;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
