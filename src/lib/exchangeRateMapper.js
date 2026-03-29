export const mapRefreshResultFromApi = (payload = {}) => ({
  baseCurrency: payload.base_currency || "",
  checkedAt: payload.checked_at || null,
  sourceProvider: payload.source_provider || null,
  summary: {
    total: payload.summary?.total ?? 0,
    updated: payload.summary?.updated ?? 0,
    unchanged: payload.summary?.unchanged ?? 0,
    failed: payload.summary?.failed ?? 0,
  },
  results: Array.isArray(payload.results)
    ? payload.results.map((item) => ({
        currencyCode: item.currency_code || "",
        status: item.status || "failed",
        previousRate: item.previous_rate,
        newRate: item.new_rate,
        sourceProvider: item.source_provider || null,
        checkedAt: item.checked_at || null,
        baseCurrency: item.base_currency || payload.base_currency || "",
        error: item.error || null,
      }))
    : [],
});
