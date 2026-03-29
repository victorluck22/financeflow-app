import test from "node:test";
import assert from "node:assert/strict";
import { buildTransactionPayload } from "./transactionPayload.js";

test("buildTransactionPayload keeps income payload without category", () => {
  const payload = buildTransactionPayload({
    type: "receita",
    amount: "150.75",
    date: "2026-03-05",
    category: "",
    paymentMethod: "3",
    paymentCardId: "",
    currencyId: "2",
    description: "Freela",
  });

  assert.equal(payload.transaction_type, "income");
  assert.equal(payload.category_id, null);
  assert.equal(payload.amount, 150.75);
  assert.equal(payload.payment_method_id, 3);
  assert.equal(payload.currency_id, 2);
});

test("buildTransactionPayload keeps expense payload with category", () => {
  const payload = buildTransactionPayload({
    type: "expense",
    amount: "42.10",
    date: "2026-03-05",
    category: "7",
    paymentMethod: "2",
    paymentCardId: "none",
    currencyId: "1",
    description: "Mercado",
  });

  assert.equal(payload.transaction_type, "expense");
  assert.equal(payload.category_id, 7);
  assert.equal(payload.payment_card_id, null);
  assert.equal(payload.payment_method_id, 2);
  assert.equal(payload.currency_id, 1);
});

test("buildTransactionPayload includes owner_user_id when responsible is selected", () => {
  const payload = buildTransactionPayload({
    type: "expense",
    amount: "90.00",
    date: "2026-03-06",
    category: "3",
    paymentMethod: "2",
    paymentCardId: "none",
    currencyId: "1",
    userId: "12",
  });

  assert.equal(payload.owner_user_id, 12);
});
