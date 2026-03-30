/**
 * Mock implementation of Radix UI Select components for tests.
 * This file intentionally avoids JSX so it can be imported from .js tests.
 */

import React from "react";

function extractText(node) {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) return extractText(node.props?.children);
  return "";
}

export const MockSelect = React.forwardRef(function MockSelect(
  { value = "", onValueChange, children, disabled, ...props },
  ref,
) {
  return React.createElement(
    "select",
    {
      ref,
      value,
      disabled,
      onChange: (e) => onValueChange?.(e.target.value),
      "data-testid": "mock-select",
      ...props,
    },
    children,
  );
});

export function MockSelectContent({ children }) {
  return React.createElement(React.Fragment, null, children);
}

export function MockSelectTrigger({ children }) {
  return React.createElement(React.Fragment, null, children);
}

export function MockSelectValue({ placeholder }) {
  return React.createElement("option", { value: "" }, placeholder);
}

export function MockSelectItem({ children, value, ...props }) {
  return React.createElement(
    "option",
    { value, ...props },
    extractText(children),
  );
}

export function selectOption(selectElement, value) {
  if (!selectElement) {
    console.warn("[MockSelect] selectOption called with null element");
    return;
  }

  const select =
    selectElement.tagName === "SELECT"
      ? selectElement
      : selectElement.querySelector("select");

  if (!select) {
    console.warn("[MockSelect] Could not find select element in selectOption");
    return;
  }

  select.value = value;
  const event = new Event("change", { bubbles: true });
  Object.defineProperty(event, "target", {
    value: select,
    enumerable: true,
  });
  select.dispatchEvent(event);
}

export function checkSelectMockFidelity(props) {
  const unsupportedProps = ["multiple", "size", "autoFocus", "form"];
  const usedUnsupported = unsupportedProps.filter(
    (prop) => prop in (props || {}),
  );

  if (usedUnsupported.length > 0) {
    console.warn(
      `[MockSelect] Unsupported props detected: ${usedUnsupported.join(", ")}. Mock behavior may diverge from actual Radix Select.`,
    );
  }
}
