import { api } from "../lib/axios";

export const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await api.post("/uploads/image",formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};