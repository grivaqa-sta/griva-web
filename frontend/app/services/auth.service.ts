import { api } from "../lib/axios";
import { LoginRequest, RegisterRequest } from "../types/types";

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post("/auth/register",data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    console.log("api working");
    const response = await api.post("/auth/login",data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password",{ email });
    return response.data;
  },

  resetPassword: async (token: string,password: string) => {
    const response = await api.put(`/auth/reset-password/${token}`,{password});
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};