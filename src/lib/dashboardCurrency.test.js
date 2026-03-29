import test from "node:test";
import assert from "node:assert/strict";
import {
  filterTransactionsByCurrency,
  formatDashboardAmount,
  getDashboardCurrencySymbol,
  resolveInitialCurrencyFilter,
  resolveDashboardCurrency,
} from "./dashboardCurrency.js";

test("resolveInitialCurrencyFilter keeps user default currency", () => {
  assert.equal(resolveInitialCurrencyFilter("5"), "5");
  assert.equal(resolveInitialCurrencyFilter(3), "3");
});

test("resolveInitialCurrencyFilter falls back to all", () => {
  assert.equal(resolveInitialCurrencyFilter(""), "all");
  assert.equal(resolveInitialCurrencyFilter(null), "all");
});

test("filterTransactionsByCurrency returns all when all selected", () => {
  const transactions = [
    { id: 1, currency_id: 1 },
    { id: 2, currency_id: 2 },
  ];

  assert.equal(filterTransactionsByCurrency(transactions, "all").length, 2);
});

test("filterTransactionsByCurrency keeps only selected currency", () => {
  const transactions = [
    { id: 1, currency_id: 1 },
    { id: 2, currency_id: 2 },
    { id: 3, currency_id: 2 },
  ];

  const filtered = filterTransactionsByCurrency(transactions, "2");

  assert.deepEqual(
    filtered.map((item) => item.id),
    [2, 3],
  );
});

test("resolveDashboardCurrency returns selected currency", () => {
  const currencies = [
    { id: 1, code: "BRL", symbol: "R$" },
    { id: 2, code: "USD", symbol: "$" },
  ];

  assert.deepEqual(resolveDashboardCurrency(currencies, "2"), currencies[1]);
  assert.equal(resolveDashboardCurrency(currencies, "all"), null);
});

test("getDashboardCurrencySymbol returns selected symbol or fallback", () => {
  const currencies = [
    { id: 1, code: "BRL", symbol: "R$" },
    { id: 2, code: "EUR", symbol: "EUR" },
  ];

  assert.equal(getDashboardCurrencySymbol(currencies, "2"), "EUR");
  assert.equal(getDashboardCurrencySymbol(currencies, "all"), "R$");
  assert.equal(getDashboardCurrencySymbol([], "2", "$"), "$");
});

test("formatDashboardAmount prints selected symbol and two decimals", () => {
  const currencies = [{ id: 3, code: "USD", symbol: "$" }];

  assert.equal(formatDashboardAmount(15.5, currencies, "3"), "$ 15.50");
  assert.equal(formatDashboardAmount(undefined, currencies, "all"), "R$ 0.00");
});
