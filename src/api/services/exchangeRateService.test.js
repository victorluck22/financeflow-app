import { test, expect } from "vitest";

import { mapRefreshResultFromApi } from "../../lib/exchangeRateMapper.js";

test("mapRefreshResultFromApi converts snake_case payload to camelCase", () => {
  const mapped = mapRefreshResultFromApi({
    base_currency: "BRL",
    checked_at: "2026-03-07T10:00:00Z",
    source_provider: "frankfurter",
    summary: {
      total: 2,
      updated: 1,
      unchanged: 1,
      failed: 0,
    },
    results: [
      {
        currency_code: "USD",
        status: "updated",
        previous_rate: "0.200000",
        new_rate: "0.210000",
        source_provider: "frankfurter",
        checked_at: "2026-03-07T10:00:00Z",
        base_currency: "BRL",
        error: null,
      },
    ],
  });

  expect(mapped.baseCurrency).toBe("BRL");
  expect(mapped.sourceProvider).toBe("frankfurter");
  expect(mapped.summary.updated).toBe(1);
  expect(mapped.results[0].currencyCode).toBe("USD");
  expect(mapped.results[0].previousRate).toBe("0.200000");
  expect(mapped.results[0].newRate).toBe("0.210000");
});

test("mapRefreshResultFromApi returns safe defaults for empty payload", () => {
  const mapped = mapRefreshResultFromApi();

  expect(mapped.baseCurrency).toBe("");
  expect(mapped.summary.total).toBe(0);
  expect(mapped.results).toEqual([]);
});
