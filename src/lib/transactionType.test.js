import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTransactionType,
  toApiTransactionType,
  TRANSACTION_TYPE,
} from "./transactionType.js";

test("normalizeTransactionType maps aliases to canonical values", () => {
  assert.equal(normalizeTransactionType("receita"), TRANSACTION_TYPE.income);
  assert.equal(normalizeTransactionType("despesa"), TRANSACTION_TYPE.expense);
  assert.equal(normalizeTransactionType("income"), TRANSACTION_TYPE.income);
  assert.equal(normalizeTransactionType("expense"), TRANSACTION_TYPE.expense);
});

test("normalizeTransactionType falls back to expense for unknown values", () => {
  assert.equal(
    normalizeTransactionType("unexpected"),
    TRANSACTION_TYPE.expense,
  );
  assert.equal(normalizeTransactionType(undefined), TRANSACTION_TYPE.expense);
});

test("toApiTransactionType always returns canonical backend value", () => {
  assert.equal(toApiTransactionType("receita"), "income");
  assert.equal(toApiTransactionType("despesa"), "expense");
});
