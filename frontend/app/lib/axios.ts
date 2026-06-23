import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    let token = null;
    if (pathname.startsWith("/admin")) {
      const activeRole = sessionStorage.getItem("griva_active_role");
      if (activeRole === "staff") {
        token = localStorage.getItem("griva_staff_token");
      } else if (activeRole === "admin") {
        token = localStorage.getItem("griva_admin_token");
      } else {
        token = localStorage.getItem("griva_admin_token") || localStorage.getItem("griva_staff_token");
      }
    } else if (pathname.startsWith("/delivery")) {
      token = localStorage.getItem("griva_delivery_token");
    } else {
      token = localStorage.getItem("griva_user_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("blocked")
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("griva_user_token");
        localStorage.removeItem("griva_user");

        const event = new CustomEvent("griva-user-blocked", {
          detail: { message: error.response.data.message },
        });
        window.dispatchEvent(event);
      }
    }
    return Promise.reject(error);
  }
);