import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, beforeEach, expect, it, vi } from "vitest";

import ExchangeRatesPage from "./ExchangeRatesPage";

const {
  mockToast,
  mockGetAllRates,
  mockRefreshRates,
  mockCreateRate,
  mockHttpGet,
} = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockGetAllRates: vi.fn(),
  mockRefreshRates: vi.fn(),
  mockCreateRate: vi.fn(),
  mockHttpGet: vi.fn(),
}));

vi.mock("react-helmet", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("lucide-react", () => ({
  Plus: () => <span aria-hidden="true">plus</span>,
  RefreshCw: () => <span aria-hidden="true">refresh</span>,
  DollarSign: () => <span aria-hidden="true">dollar</span>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  CardDescription: ({ children, ...props }) => <p {...props}>{children}</p>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }) => <div>{children}</div>,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h3>{children}</h3>,
  DialogTrigger: ({ children }) => <div>{children}</div>,
  DialogFooter: ({ children }) => <div>{children}</div>,
  DialogClose: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }) => <button type="button">{children}</button>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock("@/api/httpClient", () => ({
  default: {
    get: mockHttpGet,
  },
}));

vi.mock("@/api/services/exchangeRateService", () => ({
  exchangeRateService: {
    getAllRates: (...args) => mockGetAllRates(...args),
    refreshRates: (...args) => mockRefreshRates(...args),
    createRate: (...args) => mockCreateRate(...args),
  },
}));

const buildRatesResponse = () => ({
  success: true,
  data: [
    {
      id: 99,
      from_currency: { code: "BRL" },
      to_currency: { code: "USD" },
      rate: "0.200000",
    },
  ],
});

const buildCurrenciesResponse = () => ({
  data: {
    success: true,
    data: [
      { id: 1, name: "Real Brasileiro", code: "BRL" },
      { id: 2, name: "Dolar Americano", code: "USD" },
      { id: 3, name: "Euro", code: "EUR" },
    ],
  },
});

describe("ExchangeRatesPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRate.mockResolvedValue({ success: true });
    mockGetAllRates.mockResolvedValue(buildRatesResponse());
    mockHttpGet.mockResolvedValue(buildCurrenciesResponse());
  });

  it("shows refresh loading state and disables button while request is pending", async () => {
    let resolveRefresh;
    const pendingRefresh = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    mockRefreshRates.mockReturnValue(pendingRefresh);

    render(<ExchangeRatesPage />);

    const refreshButton = await screen.findByRole("button", {
      name: "Atualizar Cotações",
    });

    fireEvent.click(refreshButton);

    expect(
      screen.getByRole("button", { name: "Atualizando cotações..." }),
    ).toBeDisabled();

    resolveRefresh({
      success: true,
      data: {
        baseCurrency: "BRL",
        summary: { total: 2, updated: 0, unchanged: 2, failed: 0 },
        results: [],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Atualizar Cotações" }),
      ).not.toBeDisabled();
    });
  });

  it("renders feedback entries for updated, unchanged and failed statuses", async () => {
    mockRefreshRates.mockResolvedValue({
      success: true,
      data: {
        baseCurrency: "BRL",
        summary: { total: 3, updated: 1, unchanged: 1, failed: 1 },
        results: [
          {
            currencyCode: "USD",
            status: "updated",
            checkedAt: "2026-03-08T12:00:00Z",
          },
          {
            currencyCode: "EUR",
            status: "unchanged",
            checkedAt: "2026-03-08T12:00:00Z",
          },
          {
            currencyCode: "JPY",
            status: "failed",
            checkedAt: "2026-03-08T12:00:00Z",
          },
        ],
      },
    });

    render(<ExchangeRatesPage />);

    const refreshButton = await screen.findByRole("button", {
      name: "Atualizar Cotações",
    });

    fireEvent.click(refreshButton);

    expect(
      await screen.findByText(/Resultado da Atualiza/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/^Atualizada$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Sem alteração$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Falhou$/i)).toBeInTheDocument();

    expect(
      screen.getByText(/Base BRL - Atualizadas:\s*1/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/falhas:\s*1/i)).toBeInTheDocument();
  });
});
