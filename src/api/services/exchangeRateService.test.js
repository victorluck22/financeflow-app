import test from "node:test";
import assert from "node:assert/strict";

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

  assert.equal(mapped.baseCurrency, "BRL");
  assert.equal(mapped.sourceProvider, "frankfurter");
  assert.equal(mapped.summary.updated, 1);
  assert.equal(mapped.results[0].currencyCode, "USD");
  assert.equal(mapped.results[0].previousRate, "0.200000");
  assert.equal(mapped.results[0].newRate, "0.210000");
});

test("mapRefreshResultFromApi returns safe defaults for empty payload", () => {
  const mapped = mapRefreshResultFromApi();

  assert.equal(mapped.baseCurrency, "");
  assert.equal(mapped.summary.total, 0);
  assert.deepEqual(mapped.results, []);
});
