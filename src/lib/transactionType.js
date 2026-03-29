export const TRANSACTION_TYPE = {
  expense: "expense",
  income: "income",
};

const TYPE_ALIASES = {
  expense: TRANSACTION_TYPE.expense,
  despesa: TRANSACTION_TYPE.expense,
  income: TRANSACTION_TYPE.income,
  receita: TRANSACTION_TYPE.income,
};

export const normalizeTransactionType = (value) => {
  if (typeof value !== "string") {
    return TRANSACTION_TYPE.expense;
  }

  const normalized = value.trim().toLowerCase();
  return TYPE_ALIASES[normalized] || TRANSACTION_TYPE.expense;
};

export const toApiTransactionType = (value) => {
  return normalizeTransactionType(value);
};
