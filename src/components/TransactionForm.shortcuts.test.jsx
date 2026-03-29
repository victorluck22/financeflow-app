import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import TransactionForm from "@/components/TransactionForm";

const {
  mockToast,
  mockGetAllCategories,
  mockCreateCategory,
  mockCreatePaymentCard,
  mockHttpGet,
  mockUser,
} = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockGetAllCategories: vi.fn(),
  mockCreateCategory: vi.fn(),
  mockCreatePaymentCard: vi.fn(),
  mockHttpGet: vi.fn(),
  mockUser: { id: 1, name: "Ana", default_dashboard_currency_id: 1 },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock("@/api/services/categoryService", () => ({
  getAllCategories: (...args) => mockGetAllCategories(...args),
  createCategory: (...args) => mockCreateCategory(...args),
}));

vi.mock("@/api/services/paymentCardService", () => ({
  createPaymentCard: (...args) => mockCreatePaymentCard(...args),
}));

vi.mock("@/api/services/expenseService", () => ({
  createExpense: vi.fn(),
  formatExpenseData: (formData) => formData,
  getExpenseById: vi.fn(),
  updateExpense: vi.fn(),
}));

vi.mock("@/api/httpClient", () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock("@/components/ui/currency-input", () => ({
  CurrencyInput: ({ onChange, value = "", ...props }) => (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type="text"
    />
  ),
}));

vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ id, value, onChange }) => (
    <input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ value = "", onValueChange, children, disabled }) => (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      data-testid="mock-select"
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ children, value }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: ({ placeholder }) => <option value="">{placeholder}</option>,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props) => <textarea {...props} />,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }) => (
    <input
      {...props}
      checked={Boolean(checked)}
      type="checkbox"
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open = true, children }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h3>{children}</h3>,
  DialogFooter: ({ children }) => <div>{children}</div>,
}));

const findSelectByOptionText = (optionText) =>
  screen
    .getAllByRole("combobox")
    .find((selectElement) =>
      Array.from(selectElement.options).some((opt) =>
        (opt.textContent || "").includes(optionText),
      ),
    );

describe("TransactionForm in-flow shortcuts", () => {
  let categories;
  let cards;

  beforeEach(() => {
    vi.clearAllMocks();

    categories = [{ id: 1, name: "Alimentação", icon: "🍽️" }];
    cards = [
      { id: 10, card_description: "Cartão inicial", card_number: "1111" },
    ];

    mockGetAllCategories.mockImplementation(async () => ({ categories }));

    mockCreateCategory.mockImplementation(async ({ name, icon }) => {
      categories = [...categories, { id: 2, name, icon }];
      return { success: true, data: { id: 2, name, icon } };
    });

    mockCreatePaymentCard.mockImplementation(async () => {
      cards = [
        ...cards,
        { id: 22, card_description: "Cartão novo", card_number: "2222" },
      ];
      return { success: true, data: { id: 22 } };
    });

    mockHttpGet.mockImplementation(async (url) => {
      if (url === "/user-group/users") {
        return { data: [{ id: 1, name: "Ana" }] };
      }

      if (url === "/payment-methods") {
        return {
          data: {
            data: [
              { id: 1, payment_method_name: "Crédito" },
              { id: 2, payment_method_name: "PIX" },
            ],
          },
        };
      }

      if (url === "/payment-cards") {
        return { data: { data: cards } };
      }

      if (url === "/currencies") {
        return {
          data: {
            data: [{ id: 1, name: "Real Brasileiro", code: "BRL" }],
          },
        };
      }

      return { data: {} };
    });
  });

  it("creates category and card via shortcuts and keeps typed transaction data", async () => {
    render(
      <TransactionForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initialTransaction={null}
      />,
    );

    const descriptionInput = await screen.findByLabelText(/descrição/i);
    fireEvent.change(descriptionInput, {
      target: { value: "Compra no mercado" },
    });

    fireEvent.click(screen.getByRole("button", { name: /criar categoria/i }));

    fireEvent.change(screen.getByLabelText(/nome da categoria/i), {
      target: { value: "Mercado" },
    });
    fireEvent.change(screen.getByLabelText(/^icone$/i), {
      target: { value: "🛒" },
    });
    const createCategoryForm = screen
      .getByLabelText(/nome da categoria/i)
      .closest("form");
    fireEvent.submit(createCategoryForm);

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalled();
    });

    const categorySelect = findSelectByOptionText("Mercado");
    expect(categorySelect?.value).toBe("2");

    const paymentSelect = findSelectByOptionText("Crédito");
    fireEvent.change(paymentSelect, { target: { value: "1" } });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /novo cartao/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /novo cartao/i }));

    fireEvent.change(screen.getByLabelText(/nome do cartao/i), {
      target: { value: "Cartão novo" },
    });
    fireEvent.change(screen.getByLabelText(/operadora/i), {
      target: { value: "Visa" },
    });
    fireEvent.change(screen.getByLabelText(/validade/i), {
      target: { value: "2030-12" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^criar cartao$/i }));

    await waitFor(() => {
      expect(mockCreatePaymentCard).toHaveBeenCalled();
    });

    const cardSelect = findSelectByOptionText("Cartão novo");
    expect(cardSelect?.value).toBe("22");
  });

  it("preserves typed transaction data when shortcut creation fails", async () => {
    mockCreateCategory.mockRejectedValueOnce(new Error("Falha categoria"));

    render(
      <TransactionForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initialTransaction={null}
      />,
    );

    const descriptionInput = await screen.findByLabelText(/descrição/i);
    fireEvent.change(descriptionInput, {
      target: { value: "Despesa importante" },
    });

    fireEvent.click(screen.getByRole("button", { name: /criar categoria/i }));

    fireEvent.change(screen.getByLabelText(/nome da categoria/i), {
      target: { value: "Nova" },
    });
    fireEvent.change(screen.getByLabelText(/^icone$/i), {
      target: { value: "📦" },
    });
    const failedCategoryForm = screen
      .getByLabelText(/nome da categoria/i)
      .closest("form");
    fireEvent.submit(failedCategoryForm);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(screen.getByLabelText(/descrição/i)).toHaveValue(
      "Despesa importante",
    );
  });
});
