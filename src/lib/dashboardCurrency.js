export const resolveInitialCurrencyFilter = (defaultCurrencyId) => {
  if (!defaultCurrencyId) {
    return "all";
  }

  return String(defaultCurrencyId);
};

export const filterTransactionsByCurrency = (transactions, currencyFilter) => {
  if (!Array.isArray(transactions) || currencyFilter === "all") {
    return Array.isArray(transactions) ? transactions : [];
  }

  return transactions.filter(
    (transaction) => String(transaction.currency_id) === String(currencyFilter),
  );
};

export const resolveDashboardCurrency = (currencies, currencyFilter) => {
  if (!Array.isArray(currencies) || currencies.length === 0) {
    return null;
  }

  if (!currencyFilter || currencyFilter === "all") {
    return null;
  }

  return (
    currencies.find(
      (currency) => String(currency.id) === String(currencyFilter),
    ) || null
  );
};

export const getDashboardCurrencySymbol = (
  currencies,
  currencyFilter,
  fallbackSymbol = "R$",
) => {
  const selectedCurrency = resolveDashboardCurrency(currencies, currencyFilter);
  return selectedCurrency?.symbol || fallbackSymbol;
};

export const formatDashboardAmount = (
  amount,
  currencies,
  currencyFilter,
  fallbackSymbol = "R$",
) => {
  const symbol = getDashboardCurrencySymbol(
    currencies,
    currencyFilter,
    fallbackSymbol,
  );
  const normalizedAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  return `${symbol} ${normalizedAmount.toFixed(2)}`;
};
