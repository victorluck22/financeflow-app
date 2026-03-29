import httpClient from "../httpClient";

/**
 * Serviço para gerenciar cartões de pagamento
 */

/**
 * Recupera todos os cartões do usuário
 * @returns {Promise<Object>} Resposta com cartões
 */
export const getAllPaymentCards = async () => {
  try {
    const { data } = await httpClient.get("/payment-cards");
    return data;
  } catch (error) {
    console.error("Erro ao recuperar cartões:", error);
    throw error;
  }
};

/**
 * Cria um novo cartão
 * @param {Object} cardData - Dados do cartão
 * @param {string} cardData.card_description - Descrição do cartão
 * @param {number} cardData.credit_limit - Limite de crédito
 * @param {number} cardData.closing_day - Dia do fechamento
 * @param {string} [cardData.loyalty_program] - Programa de fidelidade
 * @param {number} [cardData.loyalty_points] - Pontos de fidelidade
 * @returns {Promise<Object>} Dados do cartão criado
 */
export const createPaymentCard = async (cardData) => {
  try {
    const { data } = await httpClient.post("/payment-cards", cardData);
    return data;
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    throw error;
  }
};

/**
 * Atualiza um cartão existente
 * @param {number} cardId - ID do cartão
 * @param {Object} cardData - Dados atualizados do cartão
 * @returns {Promise<Object>} Dados do cartão atualizado
 */
export const updatePaymentCard = async (cardId, cardData) => {
  try {
    const { data } = await httpClient.put(`/payment-cards/${cardId}`, cardData);
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar cartão ${cardId}:`, error);
    throw error;
  }
};

/**
 * Deleta um cartão
 * @param {number} cardId - ID do cartão a deletar
 * @returns {Promise<Object>} Resposta da exclusão
 */
export const deletePaymentCard = async (cardId) => {
  try {
    const { data } = await httpClient.delete(`/payment-cards/${cardId}`);
    return data;
  } catch (error) {
    console.error(`Erro ao deletar cartão ${cardId}:`, error);
    throw error;
  }
};
