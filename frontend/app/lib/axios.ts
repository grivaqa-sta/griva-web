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
      token = localStorage.getItem("griva_admin_token");
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