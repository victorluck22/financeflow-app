/**
 * Render helpers that combine Radix component mocks for consistent test setup.
 * Also handles Framer Motion mocking to prevent jsdom errors.
 */

import React from "react";
import { render } from "@testing-library/react";
import { MockDialog } from "./mocks/dialog";
import { MockCheckbox } from "./mocks/checkbox";
import { MockSelect } from "./mocks/select";

/**
 * Setup Framer Motion mocks to prevent jsdom rendering errors.
 * Call this once at the top of your test file or in beforeAll.
 */
export function setupFramerMotionMocks() {
  // Mock AnimatePresence
  jest.mock("framer-motion", () => ({
    AnimatePresence: ({ children }) => children,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => (
        <button {...props}>{children}</button>
      ),
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
  }));
}

/**
 * Replace actual Radix UI components with mocks during tests.
 * Call in beforeAll or beforeEach depending on your needs.
 */
export function setupRadixMocks() {
  // Mock @radix-ui/react-dialog
  jest.mock("@radix-ui/react-dialog", () => ({
    ...MockDialog,
  }));

  // Mock @radix-ui/react-select
  jest.mock("@radix-ui/react-select", () => ({
    Select: {
      Root: MockSelect,
      Trigger: ({ children, ...props }) => (
        <button {...props}>{children}</button>
      ),
      Content: ({ children, ...props }) => <div {...props}>{children}</div>,
      Item: ({ children, value, ...props }) => (
        <option value={value} {...props}>
          {children}
        </option>
      ),
      Value: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
  }));

  // Mock @radix-ui/react-checkbox
  jest.mock("@radix-ui/react-checkbox", () => ({
    Root: MockCheckbox,
  }));
}

/**
 * Render a component with Dialog mock.
 * Useful for testing components that use Radix Dialog.
 */
export function renderWithDialog(element, options = {}) {
  const Wrapper = ({ children }) => (
    <MockDialog.Root>{children}</MockDialog.Root>
  );

  return render(element, { wrapper: Wrapper, ...options });
}

/**
 * Render a component with Checkbox mock.
 * Useful for testing components that use Radix Checkbox.
 */
export function renderWithCheckbox(element, options = {}) {
  const Wrapper = ({ children }) => children;

  return render(element, { wrapper: Wrapper, ...options });
}

/**
 * Render a component with Dialog, Select, and Checkbox mocks.
 * Useful for testing complex forms with multiple Radix components.
 */
export function renderWithDialogForm(element, options = {}) {
  const Wrapper = ({ children }) => (
    <MockDialog.Root>{children}</MockDialog.Root>
  );

  return render(element, { wrapper: Wrapper, ...options });
}

/**
 * Render with all mocks initialized.
 * Call setupRadixMocks() before using this.
 */
export function renderWithAllMocks(element, options = {}) {
  const Wrapper = ({ children }) => (
    <MockDialog.Root>{children}</MockDialog.Root>
  );

  return render(element, { wrapper: Wrapper, ...options });
}

/**
 * Get mock dialog instance for test assertions.
 * Use after rendering with renderWithDialog.
 */
export function getDialogTrigger(container) {
  return container.querySelector('[data-testid="dialog-trigger"]');
}

export function getDialogContent(container) {
  return container.querySelector('[data-testid="dialog-content"]');
}

export function getDialogClose(container) {
  return container.querySelector('[data-testid="dialog-close"]');
}

export function getDialogTitle(container) {
  return container.querySelector('[data-testid="dialog-title"]');
}

/**
 * Get mock select instance for test assertions.
 */
export function getMockSelect(container) {
  return container.querySelector('[data-testid="mock-select"]');
}

/**
 * Get mock checkbox instance for test assertions.
 */
export function getMockCheckbox(container) {
  return container.querySelector('[data-testid="mock-checkbox"]');
}

/**
 * Verify that component is using mocked Radix components.
 * Logs warnings if unsupported props are detected.
 */
export function verifyMockFidelity(componentProps) {
  // Check for commonly unsupported props
  const unsupported = [
    "asChild",
    "forceMount",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
  ];

  const found = unsupported.filter((prop) => prop in componentProps);

  if (found.length > 0) {
    console.warn(
      `[renderHelpers] Component uses unsupported props in mocks: ${found.join(", ")}. ` +
        `Real behavior may differ from mocked behavior.`,
    );
  }
}

/**
 * Helper to reset all mocks after tests.
 * Call in afterEach to ensure clean state.
 */
export function resetAllMocks() {
  jest.clearAllMocks();
}
