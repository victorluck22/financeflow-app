import httpClient from "../httpClient";
import { toApiTransactionType, TRANSACTION_TYPE } from "@/lib/transactionType";
import { buildTransactionPayload } from "@/lib/transactionPayload";

/**
 * Serviço para gerenciar despesas/transações
 * Segue o padrão RESTful com boas práticas
 */

/**
 * Recupera todas as despesas do usuário
 * @param {Object} params - Parâmetros de paginação e filtros
 * @param {number} params.page - Página para paginação
 * @param {string} params.sort - Campo para ordenação
 * @returns {Promise<Object>} Resposta com despesas
 */
export const getAllExpenses = async (params = {}) => {
  try {
    const { data } = await httpClient.get("/expenses", { params });
    return data;
  } catch (error) {
    console.error("Erro ao recuperar despesas:", error);
    throw error;
  }
};

/**
 * Recupera uma despesa específica
 * @param {number} expenseId - ID da despesa
 * @returns {Promise<Object>} Dados da despesa
 */
export const getExpenseById = async (expenseId) => {
  try {
    const { data } = await httpClient.get(`/expenses/${expenseId}`);
    return data;
  } catch (error) {
    console.error(`Erro ao recuperar despesa ${expenseId}:`, error);
    throw error;
  }
};

/**
 * Cria uma nova despesa
 * @param {Object} expenseData - Dados da despesa
 * @param {number} expenseData.category_id - ID da categoria
 * @param {number} expenseData.amount - Valor da despesa
 * @param {string} expenseData.date - Data da despesa (YYYY-MM-DD)
 * @param {string} [expenseData.description] - Descrição
 * @param {string} [expenseData.place] - Local da despesa
 * @param {number} [expenseData.payment_method_id] - ID do método de pagamento
 * @param {number} [expenseData.payment_card_id] - ID do cartão de pagamento
 * @returns {Promise<Object>} Dados da despesa criada
 */
export const createExpense = async (expenseData) => {
  try {
    const transactionType = toApiTransactionType(expenseData.transaction_type);

    // Validação básica
    if (
      transactionType === TRANSACTION_TYPE.expense &&
      !expenseData.category_id
    ) {
      throw new Error("Categoria é obrigatória");
    }
    if (!expenseData.amount || expenseData.amount <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }
    if (!expenseData.date) {
      throw new Error("Data é obrigatória");
    }
    if (!expenseData.currency_id) {
      throw new Error("Moeda é obrigatória");
    }

    const payload = {
      ...expenseData,
      transaction_type: transactionType,
    };

    const { data } = await httpClient.post("/expenses", payload);
    return data;
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    throw error;
  }
};

/**
 * Atualiza uma despesa existente
 * @param {number} expenseId - ID da despesa
 * @param {Object} expenseData - Dados a atualizar
 * @returns {Promise<Object>} Dados atualizados da despesa
 */
export const updateExpense = async (expenseId, expenseData) => {
  try {
    const { data } = await httpClient.put(
      `/expenses/${expenseId}`,
      expenseData,
    );
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar despesa ${expenseId}:`, error);
    throw error;
  }
};

/**
 * Remove uma despesa
 * @param {number} expenseId - ID da despesa a remover
 * @returns {Promise<Object>} Resposta do servidor
 */
export const deleteExpense = async (expenseId) => {
  try {
    const { data } = await httpClient.delete(`/expenses/${expenseId}`);
    return data;
  } catch (error) {
    console.error(`Erro ao remover despesa ${expenseId}:`, error);
    throw error;
  }
};

/**
 * Formata dados do formulário para o formato esperado pela API
 * @param {Object} formData - Dados do formulário
 * @returns {Object} Dados formatados para a API
 */
export const formatExpenseData = (formData) => {
  return buildTransactionPayload(formData);
};
