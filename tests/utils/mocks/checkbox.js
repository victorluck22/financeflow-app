/**
 * Mock implementation of Radix UI Checkbox component for testing.
 * Provides checked state management and test helpers.
 */

import React from "react";

/**
 * MockCheckbox component that mimics Radix Checkbox behavior.
 */
export const MockCheckbox = React.forwardRef(
  (
    {
      checked = false,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      required = false,
      name,
      id,
      value,
      ...props
    },
    ref,
  ) => {
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] =
      React.useState(defaultChecked);

    const currentChecked = isControlled ? checked : internalChecked;

    const handleChange = (e) => {
      const newChecked = e.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
    };

    return (
      <input
        ref={ref}
        type="checkbox"
        checked={currentChecked}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        // Store value for test assertions
        data-value={value}
        data-testid="mock-checkbox"
        {...props}
      />
    );
  },
);

MockCheckbox.displayName = "MockCheckbox";

/**
 * Helper to toggle checkbox state in tests.
 */
export function toggleCheckbox(checkboxElement) {
  if (!checkboxElement) {
    console.warn("[MockCheckbox] toggleCheckbox called with null element");
    return;
  }

  const checkbox =
    checkboxElement.tagName === "INPUT"
      ? checkboxElement
      : checkboxElement.querySelector('input[type="checkbox"]');

  if (!checkbox) {
    console.warn(
      "[MockCheckbox] Could not find checkbox element in toggleCheckbox",
    );
    return;
  }

  checkbox.checked = !checkbox.checked;

  // Trigger change event
  const event = new Event("change", { bubbles: true });
  Object.defineProperty(event, "target", {
    value: checkbox,
    enumerable: true,
  });

  checkbox.dispatchEvent(event);
}

/**
 * Helper to set checkbox state in tests.
 */
export function setCheckboxState(checkboxElement, checked) {
  if (!checkboxElement) {
    console.warn("[MockCheckbox] setCheckboxState called with null element");
    return;
  }

  const checkbox =
    checkboxElement.tagName === "INPUT"
      ? checkboxElement
      : checkboxElement.querySelector('input[type="checkbox"]');

  if (!checkbox) {
    console.warn(
      "[MockCheckbox] Could not find checkbox element in setCheckboxState",
    );
    return;
  }

  checkbox.checked = checked;

  // Trigger change event
  const event = new Event("change", { bubbles: true });
  Object.defineProperty(event, "target", {
    value: checkbox,
    enumerable: true,
  });

  checkbox.dispatchEvent(event);
}

/**
 * Warn if Checkbox mock is used with unsupported props.
 */
export function checkCheckboxMockFidelity(props) {
  const unsupportedProps = ["indeterminate", "asChild", "aria-describedby"];
  const usedUnsupported = unsupportedProps.filter((prop) => prop in props);

  if (usedUnsupported.length > 0) {
    console.warn(
      `[MockCheckbox] Unsupported props detected: ${usedUnsupported.join(", ")}. ` +
        `Mock behavior may diverge from actual Radix Checkbox.`,
    );
  }
}
