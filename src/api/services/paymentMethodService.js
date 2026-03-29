import httpClient from "../httpClient";

export const paymentMethodService = {
  getAllPaymentMethods: async () => {
    try {
      const response = await httpClient.get("/payment-methods");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar métodos de pagamento:", error);
      throw error;
    }
  },
};
