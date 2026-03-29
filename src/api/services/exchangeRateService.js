import httpClient from "../httpClient.js";
import { mapRefreshResultFromApi } from "@/lib/exchangeRateMapper";

export const exchangeRateService = {
  async getAllRates() {
    const response = await httpClient.get("/exchange-rates");
    return response.data;
  },

  async createRate(payload) {
    const response = await httpClient.post("/exchange-rates", payload);
    return response.data;
  },

  async refreshRates(payload = {}) {
    const response = await httpClient.post("/exchange-rates/refresh", payload);

    return {
      ...response.data,
      data: mapRefreshResultFromApi(response.data?.data),
    };
  },
};
