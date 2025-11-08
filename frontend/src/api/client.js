import axios from "axios";

const envBase = import.meta.env.VITE_API_BASE_URL;
const baseURL = envBase ? envBase.replace(/\/$/, "") : undefined;
const devFallback = import.meta.env.DEV ? "http://localhost:5000" : undefined;

export const apiClient = axios.create({
  baseURL: baseURL || devFallback,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function request(path, options = {}) {
  try {
    const response = await apiClient({
      url: path,
      ...options,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    throw normalizedError;
  }
}
