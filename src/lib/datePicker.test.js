import { test, expect } from "vitest";

import {
  extractTimeFromCanonical,
  formatCanonicalForDisplay,
  isCanonicalDate,
  isCanonicalDateTime,
  mergeDateAndTimeToCanonical,
  normalizeRangeValue,
  normalizeTimeValue,
  parseCanonicalDate,
  toRangeComparisonBounds,
} from "./datePicker.js";

test("isCanonicalDate validates yyyy-MM-dd", () => {
  expect(isCanonicalDate("2026-03-07")).toBe(true);
  expect(isCanonicalDate("07/03/2026")).toBe(false);
  expect(isCanonicalDate("2026-13-01")).toBe(false);
});

test("isCanonicalDateTime validates yyyy-MM-dd HH:mm", () => {
  expect(isCanonicalDateTime("2026-03-07 14:45")).toBe(true);
  expect(isCanonicalDateTime("2026-03-07 24:00")).toBe(false);
  expect(isCanonicalDateTime("2026-03-07")).toBe(false);
});

test("mergeDateAndTimeToCanonical emits canonical single-date and date-time", () => {
  const date = new Date(2026, 2, 7, 10, 15, 0);

  expect(mergeDateAndTimeToCanonical(date, { enableTime: false })).toBe(
    "2026-03-07",
  );
  expect(
    mergeDateAndTimeToCanonical(date, {
      enableTime: true,
      timeValue: "18:20",
    }),
  ).toBe("2026-03-07 18:20");
});

test("formatCanonicalForDisplay formats pt-BR labels", () => {
  expect(formatCanonicalForDisplay("2026-03-07", { enableTime: false })).toBe(
    "07/03/2026",
  );
  expect(
    formatCanonicalForDisplay("2026-03-07 18:20", { enableTime: true }),
  ).toBe("07/03/2026 18:20");
});

test("normalize helpers keep safe defaults and partial range", () => {
  expect(normalizeTimeValue("14:59")).toBe("14:59");
  expect(normalizeTimeValue("50:10")).toBe("00:00");
  expect(extractTimeFromCanonical("2026-03-07 08:10")).toBe("08:10");
  expect(normalizeRangeValue({ startDate: "2026-03-01" })).toEqual({
    startDate: "2026-03-01",
    endDate: "",
  });
});

test("toRangeComparisonBounds handles empty and valid bounds", () => {
  const empty = toRangeComparisonBounds({ startDate: "", endDate: "" });
  expect(empty.startDate).toBeNull();
  expect(empty.endDate).toBeNull();

  const range = toRangeComparisonBounds({
    startDate: "2026-03-07",
    endDate: "2026-03-07",
  });

  expect(range.startDate?.getHours()).toBe(0);
  expect(range.endDate?.getHours()).toBe(23);
  expect(parseCanonicalDate("2026-03-07")).toBeTruthy();
});
