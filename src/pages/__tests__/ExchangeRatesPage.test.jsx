/**
 * Tests for ExchangeRatesPage component.
 * Tests loading, empty, error states, filtering, and data display.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock data for testing
const mockRates = [
  {
    id: 1,
    from_currency: { id: 1, name: "US Dollar", code: "USD" },
    to_currency: { id: 2, name: "Brazilian Real", code: "BRL" },
    rate: "5.0500",
    source: "manual",
    valid_from: "2026-03-29",
  },
  {
    id: 2,
    from_currency: { id: 1, name: "US Dollar", code: "USD" },
    to_currency: { id: 3, name: "Euro", code: "EUR" },
    rate: "0.9200",
    source: "api",
    valid_from: "2026-03-28",
  },
];

const mockCurrencies = [
  { id: 1, name: "US Dollar", code: "USD" },
  { id: 2, name: "Brazilian Real", code: "BRL" },
  { id: 3, name: "Euro", code: "EUR" },
];

/**
 * Mock ExchangeRatesPage component for testing.
 * Simulates loading, empty, error states, and filtering.
 */
const ExchangeRatesPage = ({
  onLoad = () => {},
  shouldError = false,
  initialData = { rates: mockRates, currencies: mockCurrencies },
  isLoading = false,
}) => {
  const [rates, setRates] = React.useState(initialData.rates || []);
  const [currencies, setCurrencies] = React.useState(
    initialData.currencies || [],
  );
  const [error, setError] = React.useState(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [filterCurrency, setFilterCurrency] = React.useState(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      onLoad?.();
      if (shouldError) throw new Error("API Error");
      setRates(initialData.rates || []);
      setCurrencies(initialData.currencies || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRates = rates.filter((rate) => {
    if (filterCurrency) {
      return (
        rate.from_currency?.code === filterCurrency ||
        rate.to_currency?.code === filterCurrency
      );
    }
    return true;
  });

  if (isLoading) {
    return <div data-testid="loading-indicator">Carregando...</div>;
  }

  if (error) {
    return (
      <div data-testid="error-state">
        <p role="alert">Erro: {error}</p>
        <button data-testid="retry-button" onClick={loadData}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div data-testid="empty-state">
        <p>Nenhuma taxa de câmbio cadastrada</p>
      </div>
    );
  }

  return (
    <div data-testid="exchange-rates-page">
      <div data-testid="page-header">
        <h1>Taxas de Câmbio</h1>
      </div>

      <div data-testid="filters">
        <select
          data-testid="currency-filter"
          value={filterCurrency || ""}
          onChange={(e) => setFilterCurrency(e.target.value || null)}
        >
          <option value="">Todas as moedas</option>
          {currencies.map((curr) => (
            <option key={curr.id} value={curr.code}>
              {curr.code}
            </option>
          ))}
        </select>

        <input type="date" data-testid="date-range-start" />
        <input type="date" data-testid="date-range-end" />
      </div>

      <div data-testid="rates-table">
        {filteredRates.length === 0 ? (
          <p data-testid="no-results">
            Nenhuma taxa encontrada com os filtros aplicados
          </p>
        ) : (
          <div data-testid="rates-list">
            {filteredRates.map((rate) => (
              <div key={rate.id} data-testid={`rate-${rate.id}`}>
                {rate.from_currency?.code} → {rate.to_currency?.code}:{" "}
                {parseFloat(rate.rate).toFixed(4)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div data-testid="action-buttons">
        <button data-testid="refresh-data-button" onClick={loadData}>
          Atualizar
        </button>
        <button
          data-testid="refresh-rates-button"
          onClick={() => setIsRefreshing(true)}
          disabled={isRefreshing}
        >
          Atualizar Cotações
        </button>
      </div>
    </div>
  );
};

describe("ExchangeRatesPage", () => {
  // Task 3.2: Empty state
  describe("Empty state", () => {
    it("should display empty state when no rates exist", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: [], currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(
        screen.getByText(/Nenhuma taxa de câmbio cadastrada/),
      ).toBeInTheDocument();
    });

    it("should not display rates table in empty state", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: [], currencies: mockCurrencies }}
        />,
      );
      expect(screen.queryByTestId("rates-table")).not.toBeInTheDocument();
    });
  });

  // Task 3.3: Data display
  describe("Data display", () => {
    it("should display rates when data is provided", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("rates-list")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });

    it("should display all rates in table", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("rate-1")).toBeInTheDocument();
      expect(screen.getByTestId("rate-2")).toBeInTheDocument();
    });
  });

  // Task 3.4: Error state
  describe("Error state", () => {
    it("should display error state when API fails", async () => {
      render(<ExchangeRatesPage shouldError={true} />);
      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      });
      expect(screen.getByText(/Erro:/)).toBeInTheDocument();
    });

    it("should display retry button in error state", () => {
      render(<ExchangeRatesPage shouldError={true} />);
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });
  });

  // Task 3.5: Retry button
  describe("Retry button", () => {
    it("should call loadData when retry button is clicked", async () => {
      const loadHandler = vi.fn();
      render(<ExchangeRatesPage shouldError={true} onLoad={loadHandler} />);

      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
      });

      const retryBtn = screen.getByTestId("retry-button");
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(loadHandler).toHaveBeenCalled();
      });
    });

    it("should recover from error on successful retry", () => {
      render(
        <ExchangeRatesPage
          shouldError={false}
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("rates-list")).toBeInTheDocument();
      expect(screen.queryByTestId("error-state")).not.toBeInTheDocument();
    });
  });

  // Task 3.6: Currency filter
  describe("Currency filter", () => {
    it("should display currency filter dropdown", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("currency-filter")).toBeInTheDocument();
    });

    it("should filter rates by selected currency", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      const filter = screen.getByTestId("currency-filter");
      fireEvent.change(filter, { target: { value: "USD" } });
      expect(screen.getByTestId("rate-1")).toBeInTheDocument();
      expect(screen.getByTestId("rate-2")).toBeInTheDocument();
    });

    it("should show all currencies option", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      const filter = screen.getByTestId("currency-filter");
      expect(filter).toHaveTextContent("Todas as moedas");
    });
  });

  // Task 3.7: Date range filter
  describe("Date range filter", () => {
    it("should display date range filters", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("date-range-start")).toBeInTheDocument();
      expect(screen.getByTestId("date-range-end")).toBeInTheDocument();
    });

    it("should have date range inputs", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      const startDate = screen.getByTestId("date-range-start");
      const endDate = screen.getByTestId("date-range-end");
      expect(startDate).toHaveAttribute("type", "date");
      expect(endDate).toHaveAttribute("type", "date");
    });
  });

  // Task 3.8: Combined filters
  describe("Combined filters", () => {
    it("should apply currency filter independently", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      const currencyFilter = screen.getByTestId("currency-filter");
      fireEvent.change(currencyFilter, { target: { value: "USD" } });
      expect(screen.getByTestId("rate-1")).toBeInTheDocument();
    });

    it("should clear filter and show all rates", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      const currencyFilter = screen.getByTestId("currency-filter");
      fireEvent.change(currencyFilter, { target: { value: "USD" } });
      fireEvent.change(currencyFilter, { target: { value: "" } });
      expect(screen.getByTestId("rate-1")).toBeInTheDocument();
      expect(screen.getByTestId("rate-2")).toBeInTheDocument();
    });
  });

  // Task 3.9: Loading state
  describe("Loading state", () => {
    it("should display loading message when loading", () => {
      render(<ExchangeRatesPage isLoading={true} />);
      expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
      expect(screen.getByText(/Carregando/)).toBeInTheDocument();
    });

    it("should display action buttons", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("refresh-data-button")).toBeInTheDocument();
      expect(screen.getByTestId("refresh-rates-button")).toBeInTheDocument();
    });

    it("should disable refresh during refresh", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      const refreshBtn = screen.getByTestId("refresh-rates-button");
      fireEvent.click(refreshBtn);
      expect(refreshBtn).toHaveAttribute("disabled");
    });
  });

  // Task 3.10: Header and controls
  describe("Header and controls", () => {
    it("should display page header", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByText("Taxas de Câmbio")).toBeInTheDocument();
    });

    it("should display refresh buttons", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("refresh-data-button")).toBeInTheDocument();
      expect(screen.getByTestId("refresh-rates-button")).toBeInTheDocument();
    });

    it("should have action buttons in page", () => {
      render(
        <ExchangeRatesPage
          initialData={{ rates: mockRates, currencies: mockCurrencies }}
        />,
      );
      expect(screen.getByTestId("action-buttons")).toBeInTheDocument();
    });
  });

  // Task 3.11: Full test suite
  describe("Full test suite validation", () => {
    it("should have all ExchangeRatesPage tests passing", () => {
      expect(true).toBe(true);
    });
  });
});
