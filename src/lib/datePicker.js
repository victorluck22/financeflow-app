import { endOfDay, format, isValid, parse, startOfDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR/index.js";

export const CANONICAL_DATE_PATTERN = "yyyy-MM-dd";
export const CANONICAL_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm";
export const DISPLAY_DATE_PATTERN = "dd/MM/yyyy";
export const DISPLAY_DATE_TIME_PATTERN = "dd/MM/yyyy HH:mm";
export const EMPTY_DATE_RANGE = Object.freeze({ startDate: "", endDate: "" });

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeTimeValue(timeValue) {
  if (typeof timeValue !== "string") {
    return "00:00";
  }

  return TIME_PATTERN.test(timeValue) ? timeValue : "00:00";
}

export function isCanonicalDate(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const parsedDate = parse(value, CANONICAL_DATE_PATTERN, new Date());
  return (
    isValid(parsedDate) && format(parsedDate, CANONICAL_DATE_PATTERN) === value
  );
}

export function isCanonicalDateTime(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const parsedDate = parse(value, CANONICAL_DATE_TIME_PATTERN, new Date());
  return (
    isValid(parsedDate) &&
    format(parsedDate, CANONICAL_DATE_TIME_PATTERN) === value
  );
}

export function parseCanonicalDate(value, { enableTime = false } = {}) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const pattern = enableTime
    ? CANONICAL_DATE_TIME_PATTERN
    : CANONICAL_DATE_PATTERN;
  const parsedDate = parse(value, pattern, new Date());

  return isValid(parsedDate) ? parsedDate : null;
}

export function parseCanonicalDateFlexible(value) {
  return (
    parseCanonicalDate(value, { enableTime: true }) ||
    parseCanonicalDate(value, { enableTime: false })
  );
}

export function extractTimeFromCanonical(value) {
  if (typeof value !== "string") {
    return "00:00";
  }

  const timePart = value.split(" ")[1];
  return normalizeTimeValue(timePart);
}

export function toCanonicalDate(date) {
  if (!(date instanceof Date) || !isValid(date)) {
    return "";
  }

  return format(date, CANONICAL_DATE_PATTERN);
}

export function toCanonicalDateTime(date, timeValue) {
  if (!(date instanceof Date) || !isValid(date)) {
    return "";
  }

  const safeTime = normalizeTimeValue(timeValue);
  return `${format(date, CANONICAL_DATE_PATTERN)} ${safeTime}`;
}

export function mergeDateAndTimeToCanonical(
  date,
  { enableTime = false, timeValue = "00:00" } = {},
) {
  if (enableTime) {
    return toCanonicalDateTime(date, timeValue);
  }

  return toCanonicalDate(date);
}

export function formatDateForDisplay(date, { enableTime = false } = {}) {
  if (!(date instanceof Date) || !isValid(date)) {
    return "";
  }

  return format(
    date,
    enableTime ? DISPLAY_DATE_TIME_PATTERN : DISPLAY_DATE_PATTERN,
    { locale: ptBR },
  );
}

export function formatCanonicalForDisplay(value, { enableTime = false } = {}) {
  const parsedDate = parseCanonicalDate(value, { enableTime });
  if (!parsedDate) {
    return "";
  }

  return formatDateForDisplay(parsedDate, { enableTime });
}

export function normalizeRangeValue(rangeValue) {
  if (!rangeValue || typeof rangeValue !== "object") {
    return { ...EMPTY_DATE_RANGE };
  }

  return {
    startDate:
      typeof rangeValue.startDate === "string" ? rangeValue.startDate : "",
    endDate: typeof rangeValue.endDate === "string" ? rangeValue.endDate : "",
  };
}

export function toRangeComparisonBounds(rangeValue) {
  const normalizedRange = normalizeRangeValue(rangeValue);
  const startDate = parseCanonicalDateFlexible(normalizedRange.startDate);
  const endDate = parseCanonicalDateFlexible(normalizedRange.endDate);

  return {
    startDate: startDate ? startOfDay(startDate) : null,
    endDate: endDate ? endOfDay(endDate) : null,
  };
}
