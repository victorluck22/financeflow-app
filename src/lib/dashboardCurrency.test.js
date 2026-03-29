import { test, expect } from "vitest";
import {
  filterTransactionsByCurrency,
  formatDashboardAmount,
  getDashboardCurrencySymbol,
  resolveInitialCurrencyFilter,
  resolveDashboardCurrency,
} from "./dashboardCurrency.js";

test("resolveInitialCurrencyFilter keeps user default currency", () => {
  expect(resolveInitialCurrencyFilter("5")).toBe("5");
  expect(resolveInitialCurrencyFilter(3)).toBe("3");
});

test("resolveInitialCurrencyFilter falls back to all", () => {
  expect(resolveInitialCurrencyFilter("")).toBe("all");
  expect(resolveInitialCurrencyFilter(null)).toBe("all");
});

test("filterTransactionsByCurrency returns all when all selected", () => {
  const transactions = [
    { id: 1, currency_id: 1 },
    { id: 2, currency_id: 2 },
  ];

  expect(filterTransactionsByCurrency(transactions, "all").length).toBe(2);
});

test("filterTransactionsByCurrency keeps only selected currency", () => {
  const transactions = [
    { id: 1, currency_id: 1 },
    { id: 2, currency_id: 2 },
    { id: 3, currency_id: 2 },
  ];

  const filtered = filterTransactionsByCurrency(transactions, "2");

  expect(filtered.map((item) => item.id)).toEqual([2, 3]);
});

test("resolveDashboardCurrency returns selected currency", () => {
  const currencies = [
    { id: 1, code: "BRL", symbol: "R$" },
    { id: 2, code: "USD", symbol: "$" },
  ];

  expect(resolveDashboardCurrency(currencies, "2")).toEqual(currencies[1]);
  expect(resolveDashboardCurrency(currencies, "all")).toBeNull();
});

test("getDashboardCurrencySymbol returns selected symbol or fallback", () => {
  const currencies = [
    { id: 1, code: "BRL", symbol: "R$" },
    { id: 2, code: "EUR", symbol: "EUR" },
  ];

  expect(getDashboardCurrencySymbol(currencies, "2")).toBe("EUR");
  expect(getDashboardCurrencySymbol(currencies, "all")).toBe("R$");
  expect(getDashboardCurrencySymbol([], "2", "$")).toBe("$");
});

test("formatDashboardAmount prints selected symbol and two decimals", () => {
  const currencies = [{ id: 3, code: "USD", symbol: "$" }];

  expect(formatDashboardAmount(15.5, currencies, "3")).toBe("$ 15.50");
  expect(formatDashboardAmount(undefined, currencies, "all")).toBe("R$ 0.00");
});
