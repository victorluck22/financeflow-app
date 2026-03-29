import test from "node:test";
import assert from "node:assert/strict";

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
  assert.equal(isCanonicalDate("2026-03-07"), true);
  assert.equal(isCanonicalDate("07/03/2026"), false);
  assert.equal(isCanonicalDate("2026-13-01"), false);
});

test("isCanonicalDateTime validates yyyy-MM-dd HH:mm", () => {
  assert.equal(isCanonicalDateTime("2026-03-07 14:45"), true);
  assert.equal(isCanonicalDateTime("2026-03-07 24:00"), false);
  assert.equal(isCanonicalDateTime("2026-03-07"), false);
});

test("mergeDateAndTimeToCanonical emits canonical single-date and date-time", () => {
  const date = new Date(2026, 2, 7, 10, 15, 0);

  assert.equal(
    mergeDateAndTimeToCanonical(date, { enableTime: false }),
    "2026-03-07",
  );
  assert.equal(
    mergeDateAndTimeToCanonical(date, {
      enableTime: true,
      timeValue: "18:20",
    }),
    "2026-03-07 18:20",
  );
});

test("formatCanonicalForDisplay formats pt-BR labels", () => {
  assert.equal(
    formatCanonicalForDisplay("2026-03-07", { enableTime: false }),
    "07/03/2026",
  );
  assert.equal(
    formatCanonicalForDisplay("2026-03-07 18:20", { enableTime: true }),
    "07/03/2026 18:20",
  );
});

test("normalize helpers keep safe defaults and partial range", () => {
  assert.equal(normalizeTimeValue("14:59"), "14:59");
  assert.equal(normalizeTimeValue("50:10"), "00:00");
  assert.equal(extractTimeFromCanonical("2026-03-07 08:10"), "08:10");
  assert.deepEqual(normalizeRangeValue({ startDate: "2026-03-01" }), {
    startDate: "2026-03-01",
    endDate: "",
  });
});

test("toRangeComparisonBounds handles empty and valid bounds", () => {
  const empty = toRangeComparisonBounds({ startDate: "", endDate: "" });
  assert.equal(empty.startDate, null);
  assert.equal(empty.endDate, null);

  const range = toRangeComparisonBounds({
    startDate: "2026-03-07",
    endDate: "2026-03-07",
  });

  assert.equal(range.startDate?.getHours(), 0);
  assert.equal(range.endDate?.getHours(), 23);
  assert.ok(parseCanonicalDate("2026-03-07"));
});
