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
      let loginUrl = "/login";
      if (pathname.includes("/admin")) {
        loginUrl = "/admin/login";
      } else if (pathname.includes("/mentalhealth-professionals")) {
        loginUrl = "/mentalhealth-professionals/login";
      }

      if (typeof window !== "undefined") {
        window.location.href = loginUrl;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
