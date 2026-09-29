import api from "../lib/api";

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post<{ url: string }>("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
