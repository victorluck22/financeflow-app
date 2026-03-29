import axios from "axios";

const normalizeApiBaseUrl = (rawUrl) => {
  const value = (rawUrl || "").trim().replace(/\/+$/, "");
  if (!value) {
    return "/api";
  }
  return /\/api$/i.test(value) ? value : `${value}/api`;
};

const BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("finance-flow-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default httpClient;
