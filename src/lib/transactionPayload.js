import { toApiTransactionType, TRANSACTION_TYPE } from "./transactionType.js";

export const buildTransactionPayload = (formData) => {
  const transactionType = toApiTransactionType(formData.type);
  const parsedCurrencyId = formData.currencyId
    ? parseInt(formData.currencyId)
    : NaN;
  const parsedOwnerUserId = formData.userId ? parseInt(formData.userId) : NaN;

  return {
    transaction_type: transactionType,
    category_id:
      transactionType === TRANSACTION_TYPE.expense && formData.category
        ? parseInt(formData.category)
        : null,
    amount: parseFloat(formData.amount),
    date: formData.date || new Date().toISOString().split("T")[0],
    description: formData.description || null,
    place: formData.place || null,
    payment_method_id: formData.paymentMethod
      ? parseInt(formData.paymentMethod)
      : null,
    payment_card_id:
      formData.paymentCardId && formData.paymentCardId !== "none"
        ? parseInt(formData.paymentCardId)
        : null,
    currency_id: Number.isNaN(parsedCurrencyId) ? null : parsedCurrencyId,
    owner_user_id: Number.isNaN(parsedOwnerUserId) ? null : parsedOwnerUserId,
    is_recurring: formData.isRecurring || false,
  };
};
