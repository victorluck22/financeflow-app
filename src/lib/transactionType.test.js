import { test, expect } from "vitest";
import {
  normalizeTransactionType,
  toApiTransactionType,
  TRANSACTION_TYPE,
} from "./transactionType.js";

test("normalizeTransactionType maps aliases to canonical values", () => {
  expect(normalizeTransactionType("receita")).toBe(TRANSACTION_TYPE.income);
  expect(normalizeTransactionType("despesa")).toBe(TRANSACTION_TYPE.expense);
  expect(normalizeTransactionType("income")).toBe(TRANSACTION_TYPE.income);
  expect(normalizeTransactionType("expense")).toBe(TRANSACTION_TYPE.expense);
});

test("normalizeTransactionType falls back to expense for unknown values", () => {
  expect(normalizeTransactionType("unexpected")).toBe(TRANSACTION_TYPE.expense);
  expect(normalizeTransactionType(undefined)).toBe(TRANSACTION_TYPE.expense);
});

test("toApiTransactionType always returns canonical backend value", () => {
  expect(toApiTransactionType("receita")).toBe("income");
  expect(toApiTransactionType("despesa")).toBe("expense");
});
