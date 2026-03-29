import { test, expect } from "vitest";
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

  expect(payload.transaction_type).toBe("income");
  expect(payload.category_id).toBeNull();
  expect(payload.amount).toBe(150.75);
  expect(payload.payment_method_id).toBe(3);
  expect(payload.currency_id).toBe(2);
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

  expect(payload.transaction_type).toBe("expense");
  expect(payload.category_id).toBe(7);
  expect(payload.payment_card_id).toBeNull();
  expect(payload.payment_method_id).toBe(2);
  expect(payload.currency_id).toBe(1);
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

  expect(payload.owner_user_id).toBe(12);
});
