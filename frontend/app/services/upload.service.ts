import { api } from "../lib/axios";
import { compressImage } from "../utils/image";

export const uploadService = {
  uploadImage: async (file: File) => {
    // Compress image client-side to WebP to reduce size to KB before uploading
    const compressedFile = await compressImage(file);

    const formData = new FormData();
    formData.append("image", compressedFile);

    const response = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};