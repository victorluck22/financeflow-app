import React, { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import ptBR from "date-fns/locale/pt-BR/index.js";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  extractTimeFromCanonical,
  formatCanonicalForDisplay,
  mergeDateAndTimeToCanonical,
  normalizeRangeValue,
  normalizeTimeValue,
  parseCanonicalDateFlexible,
} from "@/lib/datePicker";
import { cn } from "@/lib/utils";

/**
 * DatePicker value contract:
 * - single mode: value is "YYYY-MM-DD" or "YYYY-MM-DD HH:mm" (when enableTime=true)
 * - range mode: value is { startDate: string, endDate: string } with canonical strings
 */
const DatePicker = ({
  id,
  mode = "single",
  value,
  onChange,
  enableTime = false,
  placeholder,
  disabled = false,
  className,
  buttonClassName,
  popoverClassName,
  numberOfMonths,
}) => {
  const isRangeMode = mode === "range";
  const [open, setOpen] = useState(false);
  const [singleTime, setSingleTime] = useState("00:00");
  const [rangeTimes, setRangeTimes] = useState({
    start: "00:00",
    end: "00:00",
  });

  const normalizedRange = useMemo(() => normalizeRangeValue(value), [value]);

  const selectedSingleDate = useMemo(() => {
    if (isRangeMode || typeof value !== "string") {
      return undefined;
    }

    return parseCanonicalDateFlexible(value) || undefined;
  }, [isRangeMode, value]);

  const selectedRange = useMemo(() => {
    if (!isRangeMode) {
      return undefined;
    }

    const startDate = parseCanonicalDateFlexible(normalizedRange.startDate);
    const endDate = parseCanonicalDateFlexible(normalizedRange.endDate);

    return {
      from: startDate || undefined,
      to: endDate || undefined,
    };
  }, [isRangeMode, normalizedRange]);

  useEffect(() => {
    if (!enableTime || isRangeMode || typeof value !== "string") {
      return;
    }

    setSingleTime(extractTimeFromCanonical(value));
  }, [enableTime, isRangeMode, value]);

  useEffect(() => {
    if (!enableTime || !isRangeMode) {
      return;
    }

    setRangeTimes({
      start: extractTimeFromCanonical(normalizedRange.startDate),
      end: extractTimeFromCanonical(normalizedRange.endDate),
    });
  }, [enableTime, isRangeMode, normalizedRange]);

  const displayValue = useMemo(() => {
    if (!isRangeMode) {
      if (typeof value !== "string" || value === "") {
        return placeholder || "Selecione uma data";
      }

      return (
        formatCanonicalForDisplay(value, { enableTime }) ||
        placeholder ||
        "Selecione uma data"
      );
    }

    const startLabel = formatCanonicalForDisplay(normalizedRange.startDate, {
      enableTime,
    });
    const endLabel = formatCanonicalForDisplay(normalizedRange.endDate, {
      enableTime,
    });

    if (startLabel && endLabel) {
      return `${startLabel} - ${endLabel}`;
    }

    if (startLabel) {
      return startLabel;
    }

    return placeholder || "Selecione um periodo";
  }, [enableTime, isRangeMode, normalizedRange, placeholder, value]);

  const handleSingleSelect = (date) => {
    if (!onChange) {
      return;
    }

    if (!date) {
      onChange("");
      return;
    }

    onChange(
      mergeDateAndTimeToCanonical(date, {
        enableTime,
        timeValue: singleTime,
      }),
    );

    if (!enableTime) {
      setOpen(false);
    }
  };

  const handleRangeSelect = (range) => {
    if (!onChange) {
      return;
    }

    const fromDate = range?.from;
    const toDate = range?.to;

    onChange({
      startDate: fromDate
        ? mergeDateAndTimeToCanonical(fromDate, {
            enableTime,
            timeValue: rangeTimes.start,
          })
        : "",
      endDate: toDate
        ? mergeDateAndTimeToCanonical(toDate, {
            enableTime,
            timeValue: rangeTimes.end,
          })
        : "",
    });

    if (toDate && !enableTime) {
      setOpen(false);
    }
  };

  const handleSingleTimeChange = (nextTime) => {
    const safeTime = normalizeTimeValue(nextTime);
    setSingleTime(safeTime);

    if (!onChange || !selectedSingleDate) {
      return;
    }

    onChange(
      mergeDateAndTimeToCanonical(selectedSingleDate, {
        enableTime: true,
        timeValue: safeTime,
      }),
    );
  };

  const handleRangeTimeChange = (boundary, nextTime) => {
    const safeTime = normalizeTimeValue(nextTime);
    const normalizedCurrentRange = normalizeRangeValue(value);

    setRangeTimes((prev) => ({ ...prev, [boundary]: safeTime }));

    if (!onChange) {
      return;
    }

    const boundaryKey = boundary === "start" ? "startDate" : "endDate";
    const boundaryDate = parseCanonicalDateFlexible(
      normalizedCurrentRange[boundaryKey],
    );

    if (!boundaryDate) {
      return;
    }

    onChange({
      ...normalizedCurrentRange,
      [boundaryKey]: mergeDateAndTimeToCanonical(boundaryDate, {
        enableTime: true,
        timeValue: safeTime,
      }),
    });
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-background/50",
              (displayValue === (placeholder || "Selecione uma data") ||
                displayValue === (placeholder || "Selecione um periodo")) &&
                "text-muted-foreground",
              buttonClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("w-auto p-0", popoverClassName)}
        >
          <div className="p-3">
            <Calendar
              initialFocus
              mode={isRangeMode ? "range" : "single"}
              selected={isRangeMode ? selectedRange : selectedSingleDate}
              onSelect={isRangeMode ? handleRangeSelect : handleSingleSelect}
              defaultMonth={
                isRangeMode ? selectedRange?.from : selectedSingleDate
              }
              numberOfMonths={numberOfMonths || (isRangeMode ? 2 : 1)}
              locale={ptBR}
            />

            {enableTime && !isRangeMode && (
              <div className="border-t border-border mt-3 pt-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Horario (24h)
                </label>
                <Input
                  type="time"
                  value={singleTime}
                  onChange={(event) =>
                    handleSingleTimeChange(event.target.value)
                  }
                  className="mt-2"
                />
              </div>
            )}

            {enableTime && isRangeMode && (
              <div className="border-t border-border mt-3 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Hora inicial (24h)
                  </label>
                  <Input
                    type="time"
                    value={rangeTimes.start}
                    onChange={(event) =>
                      handleRangeTimeChange("start", event.target.value)
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Hora final (24h)
                  </label>
                  <Input
                    type="time"
                    value={rangeTimes.end}
                    onChange={(event) =>
                      handleRangeTimeChange("end", event.target.value)
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { DatePicker };
