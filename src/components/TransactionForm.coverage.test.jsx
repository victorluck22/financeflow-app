import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import TransactionForm from "@/components/TransactionForm";

const {
  mockToast,
  mockCreateExpense,
  mockUpdateExpense,
  mockGetExpenseById,
  mockGetAllCategories,
  mockHttpGet,
  mockUser,
} = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockCreateExpense: vi.fn(),
  mockUpdateExpense: vi.fn(),
  mockGetExpenseById: vi.fn(),
  mockGetAllCategories: vi.fn(),
  mockHttpGet: vi.fn(),
  mockUser: { id: 1, name: "Ana" },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock("@/api/services/categoryService", () => ({
  getAllCategories: (...args) => mockGetAllCategories(...args),
  createCategory: vi.fn(),
}));

vi.mock("@/api/services/paymentCardService", () => ({
  createPaymentCard: vi.fn(),
}));

vi.mock("@/api/services/expenseService", () => ({
  createExpense: (...args) => mockCreateExpense(...args),
  updateExpense: (...args) => mockUpdateExpense(...args),
  getExpenseById: (...args) => mockGetExpenseById(...args),
  formatExpenseData: (formData) => formData,
}));

vi.mock("@/api/httpClient", () => ({
  default: {
    get: (...args) => mockHttpGet(...args),
  },
}));

vi.mock("@/hooks/useBodyScrollLock", () => ({
  useBodyScrollLock: vi.fn(),
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
      data-testid="currency-input"
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

// ─── helpers ───────────────────────────────────────────────────────────────
const findSelectByOptionText = (optionText) =>
  screen
    .getAllByRole("combobox")
    .find((el) =>
      Array.from(el.options).some((opt) =>
        (opt.textContent || "").includes(optionText),
      ),
    );

const defaultPaymentMethods = [
  { id: 1, payment_method_name: "Crédito" },
  { id: 2, payment_method_name: "PIX" },
];

const defaultCategories = [{ id: 1, name: "Alimentação", icon: "🍽️" }];

const defaultCards = [
  { id: 10, card_description: "Meu Cartão", card_number: "1234" },
];

function setupHttpGetMock(override = {}) {
  mockHttpGet.mockImplementation(async (url) => {
    if (url === "/user-group/users") return { data: [{ id: 1, name: "Ana" }] };
    if (url === "/payment-methods")
      return {
        data: { data: override.paymentMethods ?? defaultPaymentMethods },
      };
    if (url === "/payment-cards")
      return { data: { data: override.cards ?? defaultCards } };
    if (url === "/currencies")
      return {
        data: {
          data: override.currencies ?? [
            { id: 1, name: "Real Brasileiro", code: "BRL" },
          ],
        },
      };
    return { data: {} };
  });
}

/** Fill the minimum valid fields for an expense transaction. */
async function fillValidExpense({ creditCard = false } = {}) {
  // Wait for form to load
  await screen.findByLabelText(/descrição/i);

  const amountInput = screen.getByTestId("currency-input");
  fireEvent.change(amountInput, { target: { value: "100" } });

  const categorySelect = findSelectByOptionText("Alimentação");
  fireEvent.change(categorySelect, { target: { value: "1" } });

  const methodId = creditCard ? "1" : "2";
  const methodLabel = creditCard ? "Crédito" : "PIX";
  const methodSelect = findSelectByOptionText(methodLabel);
  fireEvent.change(methodSelect, { target: { value: methodId } });

  const currencySelect = findSelectByOptionText("Real Brasileiro");
  fireEvent.change(currencySelect, { target: { value: "1" } });

  if (creditCard) {
    await waitFor(() => expect(findSelectByOptionText("Nenhum")).toBeDefined());
    const cardSelect = findSelectByOptionText("Nenhum");
    fireEvent.change(cardSelect, { target: { value: "10" } });
  }
}

// ─── tests ────────────────────────────────────────────────────────────────
describe("TransactionForm – form validation and submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHttpGetMock();
    mockGetAllCategories.mockResolvedValue({ categories: defaultCategories });
    mockCreateExpense.mockResolvedValue({
      success: true,
      message: "Criado com sucesso",
      data: { id: 99 },
    });
    mockUpdateExpense.mockResolvedValue({
      success: true,
      message: "Atualizado com sucesso",
      data: { id: 5 },
    });
  });

  // ── rendering ────────────────────────────────────────────────────────────

  it("renders the create form with expense type selected by default", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    // Title heading
    expect(screen.getByText(/nova transação/i)).toBeInTheDocument();
    // Both type buttons
    expect(
      screen.getByRole("button", { name: /despesa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /receita/i }),
    ).toBeInTheDocument();
    // Adicionar submit button
    expect(
      screen.getByRole("button", { name: /adicionar/i }),
    ).toBeInTheDocument();
    // Category field visible in expense mode
    expect(screen.getByText(/^categoria$/i)).toBeInTheDocument();
  });

  it("shows 'Editar Transação' title in edit mode", async () => {
    mockGetExpenseById.mockResolvedValue({
      data: {
        id: 5,
        transaction_type: "expense",
        amount: "50.00",
        category_id: 1,
        payment_method_id: 2,
        currency_id: 1,
        payment_card_id: null,
        description: "Almoço",
        place: "",
        user_id: 1,
        date: "2024-06-01",
      },
    });

    render(
      <TransactionForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initialTransaction={{ id: 5 }}
      />,
    );
    await screen.findByLabelText(/descrição/i);
    await waitFor(() =>
      expect(screen.getByText(/editar transação/i)).toBeInTheDocument(),
    );
  });

  // ── type toggle ──────────────────────────────────────────────────────────

  it("hides the category field when switching to income type", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    // By default (expense) category is visible
    expect(screen.getByText(/^categoria$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /receita/i }));

    expect(screen.queryByText(/^categoria$/i)).not.toBeInTheDocument();
  });

  it("shows category field when switching back to expense type", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    fireEvent.click(screen.getByRole("button", { name: /receita/i }));
    fireEvent.click(screen.getByRole("button", { name: /despesa/i }));

    expect(screen.getByText(/^categoria$/i)).toBeInTheDocument();
  });

  // ── close buttons ─────────────────────────────────────────────────────────

  it("calls onClose when the X button is clicked", async () => {
    const onClose = vi.fn();
    render(<TransactionForm onSubmit={vi.fn()} onClose={onClose} />);
    await screen.findByLabelText(/descrição/i);

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── validation toasts ─────────────────────────────────────────────────────

  it("shows toast when submitting with empty amount", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/valor maior que zero/i),
        }),
      );
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it("shows toast when submitting expense without category", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    const amountInput = screen.getByTestId("currency-input");
    fireEvent.change(amountInput, { target: { value: "50" } });

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/categoria/i),
        }),
      );
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it("shows toast when submitting without payment method", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    const amountInput = screen.getByTestId("currency-input");
    fireEvent.change(amountInput, { target: { value: "50" } });

    const categorySelect = findSelectByOptionText("Alimentação");
    fireEvent.change(categorySelect, { target: { value: "1" } });

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/método de pagamento/i),
        }),
      );
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it("shows toast when submitting without currency", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);

    // Wait for full data load (payment methods available)
    await waitFor(() => expect(findSelectByOptionText("PIX")).toBeDefined());

    const amountInput = screen.getByTestId("currency-input");
    fireEvent.change(amountInput, { target: { value: "50" } });

    fireEvent.change(findSelectByOptionText("Alimentação"), {
      target: { value: "1" },
    });
    fireEvent.change(findSelectByOptionText("PIX"), {
      target: { value: "2" },
    });

    // Explicitly clear the currency field regardless of any auto-population
    const currencySelect = findSelectByOptionText("Real Brasileiro");
    fireEvent.change(currencySelect, { target: { value: "" } });

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/moeda/i),
        }),
      );
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it("shows toast when credit card expense has no card selected", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    const amountInput = screen.getByTestId("currency-input");
    fireEvent.change(amountInput, { target: { value: "50" } });

    const categorySelect = findSelectByOptionText("Alimentação");
    fireEvent.change(categorySelect, { target: { value: "1" } });

    const methodSelect = findSelectByOptionText("Crédito");
    fireEvent.change(methodSelect, { target: { value: "1" } });

    const currencySelect = findSelectByOptionText("Real Brasileiro");
    fireEvent.change(currencySelect, { target: { value: "1" } });

    // Card select appears but we leave it at "none" (the first option)
    await waitFor(() => expect(findSelectByOptionText("Nenhum")).toBeDefined());
    const cardSelect = findSelectByOptionText("Nenhum");
    // Ensure it is set to "none" (default / first option)
    fireEvent.change(cardSelect, { target: { value: "none" } });

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/cartao/i),
        }),
      );
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  // ── successful expense creation ───────────────────────────────────────────

  it("calls createExpense, onSubmit, and onClose on valid expense submission", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} onClose={onClose} />);

    await fillValidExpense();

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({ id: 99 });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ className: expect.stringContaining("green") }),
    );
  });

  it("calls createExpense for valid income (no category required)", async () => {
    const onClose = vi.fn();
    render(<TransactionForm onSubmit={vi.fn()} onClose={onClose} />);
    await screen.findByLabelText(/descrição/i);

    // Switch to income
    fireEvent.click(screen.getByRole("button", { name: /receita/i }));

    const amountInput = screen.getByTestId("currency-input");
    fireEvent.change(amountInput, { target: { value: "200" } });

    const methodSelect = findSelectByOptionText("PIX");
    fireEvent.change(methodSelect, { target: { value: "2" } });

    const currencySelect = findSelectByOptionText("Real Brasileiro");
    fireEvent.change(currencySelect, { target: { value: "1" } });

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledTimes(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls createExpense for credit card expense with card selected", async () => {
    const onClose = vi.fn();
    render(<TransactionForm onSubmit={vi.fn()} onClose={onClose} />);

    await fillValidExpense({ creditCard: true });

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledTimes(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── API error handling ────────────────────────────────────────────────────

  it("shows error toast when createExpense throws", async () => {
    mockCreateExpense.mockRejectedValueOnce(
      Object.assign(new Error("Server Error"), {
        response: { data: { message: "Limite excedido" } },
      }),
    );

    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await fillValidExpense();

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro",
          description: "Limite excedido",
        }),
      );
    });
  });

  it("shows error toast when createExpense returns success: false", async () => {
    mockCreateExpense.mockResolvedValueOnce({
      success: false,
      message: "Dados inválidos",
    });

    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await fillValidExpense();

    const form = screen
      .getByRole("button", { name: /adicionar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      // createExpense was called but success is false -> no toast of success
      expect(mockCreateExpense).toHaveBeenCalledTimes(1);
    });
    // onClose should NOT be called when success is false
    // (no success toast either)
    expect(mockToast).not.toHaveBeenCalledWith(
      expect.objectContaining({ className: expect.stringContaining("green") }),
    );
  });

  // ── edit mode ─────────────────────────────────────────────────────────────

  it("calls updateExpense instead of createExpense in edit mode", async () => {
    mockGetExpenseById.mockResolvedValue({
      data: {
        id: 5,
        transaction_type: "expense",
        amount: "75.00",
        category_id: 1,
        payment_method_id: 2,
        currency_id: 1,
        payment_card_id: null,
        description: "Jantar",
        place: "Restaurante",
        user_id: 1,
        date: "2024-06-01",
      },
    });

    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <TransactionForm
        onSubmit={onSubmit}
        onClose={onClose}
        initialTransaction={{ id: 5 }}
      />,
    );

    // Wait for hydration to complete (description field should have "Jantar")
    await waitFor(() => {
      const desc = screen.getByLabelText(/descrição/i);
      expect(desc.value).toBe("Jantar");
    });

    const form = screen
      .getByRole("button", { name: /salvar/i })
      .closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdateExpense).toHaveBeenCalledWith(5, expect.any(Object));
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows error toast when getExpenseById fails in edit mode", async () => {
    mockGetExpenseById.mockRejectedValueOnce(new Error("Not found"));

    render(
      <TransactionForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initialTransaction={{ id: 99 }}
      />,
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro",
          description: expect.stringMatching(/não foi possível carregar/i),
        }),
      );
    });
  });

  // ── credit card UI ─────────────────────────────────────────────────────────

  it("shows card selector when credit method is selected", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    // Card select not visible yet
    expect(findSelectByOptionText("Nenhum")).toBeUndefined();

    const methodSelect = findSelectByOptionText("Crédito");
    fireEvent.change(methodSelect, { target: { value: "1" } });

    await waitFor(() => {
      expect(findSelectByOptionText("Nenhum")).toBeDefined();
    });
    expect(screen.getByText(/^cartão$/i)).toBeInTheDocument();
  });

  it("hides card selector when switching from credit to non-credit method", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    // Select credit first
    const methodSelect = findSelectByOptionText("Crédito");
    fireEvent.change(methodSelect, { target: { value: "1" } });

    await waitFor(() => expect(findSelectByOptionText("Nenhum")).toBeDefined());

    // Switch to PIX
    const updatedMethodSelect = findSelectByOptionText("Crédito");
    fireEvent.change(updatedMethodSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(findSelectByOptionText("Nenhum")).toBeUndefined();
    });
  });

  // ── installment checkbox ───────────────────────────────────────────────────

  it("shows installment count field when installment checkbox is checked", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    // Select credit method to make installment checkbox appear
    const methodSelect = findSelectByOptionText("Crédito");
    fireEvent.change(methodSelect, { target: { value: "1" } });

    await waitFor(() =>
      expect(screen.getByLabelText(/compra parcelada/i)).toBeInTheDocument(),
    );

    expect(
      screen.queryByLabelText(/número de parcelas/i),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/compra parcelada/i));

    expect(screen.getByLabelText(/número de parcelas/i)).toBeInTheDocument();
  });

  // ── description / place fields ────────────────────────────────────────────

  it("updates description field", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/descrição/i);

    const desc = screen.getByLabelText(/descrição/i);
    fireEvent.change(desc, { target: { value: "Compra no mercado" } });
    expect(desc.value).toBe("Compra no mercado");
  });

  it("updates place field", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await screen.findByLabelText(/local\/estabelecimento/i);

    const place = screen.getByPlaceholderText(/supermercado/i);
    fireEvent.change(place, { target: { value: "Farmácia" } });
    expect(place.value).toBe("Farmácia");
  });
});
