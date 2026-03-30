# Test Utilities

This directory contains shared test utilities for the Finances App frontend tests, including mocks for Radix UI components, console error handling, and render helpers.

## Contents

### Mocks (`mocks/`)

#### `select.js` - Select Component Mock

Mock of `@radix-ui/react-select` that normalizes complex children to text-only options and prevents DOM nesting warnings.

**Export:** `MockSelect`, `selectOption()`, `checkSelectMockFidelity()`

**Basic Usage:**

```javascript
import { MockSelect, selectOption } from "../utils/mocks/select";

// In your test beforeAll/beforeEach
jest.mock("@radix-ui/react-select", () => require("../utils/mocks/select"));

// In your test
test("select option changes value", () => {
  const handleChange = jest.fn();
  const { container } = render(
    <MockSelect
      value="1"
      options={[{ value: "1", label: "Option 1" }]}
      onValueChange={handleChange}
    />,
  );

  const select = container.querySelector('[data-testid="mock-select"]');
  selectOption(select, "1");

  expect(handleChange).toHaveBeenCalledWith("1");
});
```

**Props:**

- `value`: Current selected value
- `onValueChange`: Callback when value changes
- `options`: Array of `{ value, label }` objects
- `children`: Alternative to options prop (renders as `<option>` elements)

**Helpers:**

- `selectOption(element, value)`: Programmatically set value and trigger onChange

#### `dialog.js` - Dialog Component Mock

Mock of `@radix-ui/react-dialog` with state management for open/close behavior.

**Export:** `MockDialog`, `checkDialogMockFidelity()`

**Components:**

- `MockDialog.Root` - Dialog container (manages state via context)
- `MockDialog.Trigger` - Button that opens dialog
- `MockDialog.Content` - Dialog content wrapper
- `MockDialog.Close` - Button that closes dialog
- `MockDialog.Title` - Dialog title
- `MockDialog.Description` - Dialog description

**Basic Usage:**

```javascript
import { MockDialog } from "../utils/mocks/dialog";

// In your test
test("dialog opens when trigger is clicked", () => {
  const { getByTestId } = render(
    <MockDialog.Root>
      <MockDialog.Trigger>Open</MockDialog.Trigger>
      <MockDialog.Content>
        <MockDialog.Title>Title</MockDialog.Title>
        <MockDialog.Close>Close</MockDialog.Close>
      </MockDialog.Content>
    </MockDialog.Root>,
  );

  const trigger = getByTestId("dialog-trigger");
  fireEvent.click(trigger);

  const content = getByTestId("dialog-content");
  expect(content).toBeInTheDocument();
});
```

#### `checkbox.js` - Checkbox Component Mock

Mock of `@radix-ui/react-checkbox` with checked state management.

**Export:** `MockCheckbox`, `toggleCheckbox()`, `setCheckboxState()`, `checkCheckboxMockFidelity()`

**Basic Usage:**

```javascript
import { MockCheckbox, toggleCheckbox } from "../utils/mocks/checkbox";

test("checkbox toggles state", () => {
  const handleChange = jest.fn();
  const { container } = render(
    <MockCheckbox checked={false} onCheckedChange={handleChange} />,
  );

  const checkbox = container.querySelector('[data-testid="mock-checkbox"]');
  toggleCheckbox(checkbox);

  expect(handleChange).toHaveBeenCalledWith(true);
});
```

**Helpers:**

- `toggleCheckbox(element)`: Toggle checkbox checked state
- `setCheckboxState(element, checked)`: Set checkbox to specific state

### Console Error Utilities (`console-spy.js`)

Centralized console.error handling for test suites. Suppress expected errors and detect unexpected ones.

**Exports:** `mockConsoleError()`, `expectConsoleError()`, `suppressExpectedError()`, `resetConsoleError()`, `expectNoConsoleError()`

**Basic Usage:**

```javascript
import { mockConsoleError } from "../utils/console-spy";

beforeEach(() => {
  const { suppressExpectedError, expect, reset } = mockConsoleError();
  // Suppress errors you expect
  suppressExpectedError("Expected error message");
});

test("component logs expected error", () => {
  // Component calls console.error internally
  render(<MyComponent />); // Logs: "Expected error message"
  // This won't cause test to fail because we suppressed it
});

afterEach(() => {
  reset(); // Restore original console.error
});
```

**API:**

- `mockConsoleError()` - Setup spy
  - Returns: `{ expect, reset, suppressExpectedError }`
  - Sets up console.error spy that tracks unsuppressed calls

- `suppressExpectedError(pattern)` - Suppress specific console.error calls
  - `pattern`: String or RegExp to match
  - Calls matching pattern are suppressed
  - Unmatched calls still cause test to fail

- `expectConsoleError(pattern, count)` - Assert console.error was called
  - `pattern`: String or RegExp to match
  - `count`: Expected number of calls (default: 1)
  - Throws if actual count doesn't match

- `expectNoConsoleError(pattern)` - Assert console.error was NOT called
  - If `pattern` is undefined: assert NO console.error calls
  - If `pattern` provided: assert error NOT called with pattern

- `resetConsoleError(original)` - Restore original console.error
  - Call in afterEach to clean up

### Render Helpers (`render-helpers.js`)

Helpers to render components with mocks pre-configured.

**Exports:** `renderWithDialog()`, `renderWithCheckbox()`, `renderWithDialogForm()`, `setupFramerMotionMocks()`, `setupRadixMocks()`

**Utility Functions:**

- `getDialogTrigger(container)` - Get trigger element
- `getDialogContent(container)` - Get content element
- `getDialogClose(container)` - Get close button
- `getMockSelect(container)` - Get select element
- `getMockCheckbox(container)` - Get checkbox element

**Basic Usage:**

```javascript
import { renderWithDialog, getDialogTrigger } from "../utils/render-helpers";

test("dialog workflow", () => {
  const { container } = renderWithDialog(<MyComponent />);

  const trigger = getDialogTrigger(container);
  fireEvent.click(trigger);

  // Dialog is now open
});
```

## Migration Guide

### Converting Existing Tests

If you have existing tests with duplicate mocks:

1. **Replace inline Select mock:**

```javascript
// Before
jest.mock("@radix-ui/react-select", () => ({
  Select: {
    Root: ({ children }) => <select>{children}</select>,
    Trigger: ({ children }) => <button>{children}</button>,
    // ... more manual implementation
  },
}));

// After
import { MockSelect } from "../utils/mocks/select";
jest.mock("@radix-ui/react-select", () => require("../utils/mocks/select"));
```

2. **Add console.error spy:**

```javascript
// Before
test("component handles error", () => {
  // console.error logs pollute test output
  render(<MyComponent />);
});

// After
import { mockConsoleError } from "../utils/console-spy";

beforeEach(() => {
  const { suppressExpectedError } = mockConsoleError();
  suppressExpectedError("Expected error");
});

afterEach(() => {
  reset();
});

test("component handles error", () => {
  render(<MyComponent />);
  // No output pollution
});
```

3. **Use render helpers:**

```javascript
// Before
test("dialog test", () => {
  const Wrapper = ({ children }) => (
    <DialogContext.Provider>{children}</DialogContext.Provider>
  );
  render(<MyComponent />, { wrapper: Wrapper });
});

// After
import { renderWithDialog } from "../utils/render-helpers";

test("dialog test", () => {
  renderWithDialog(<MyComponent />);
});
```

## Troubleshooting

### "Cannot find module '@radix-ui/react-select'"

Make sure you've called `jest.mock()` pointing to the mock file:

```javascript
jest.mock("@radix-ui/react-select", () => require("../utils/mocks/select"));
```

### "selectOption is not triggering onChange"

Verify the element passed to `selectOption()` is correct:

```javascript
const select = container.querySelector('[data-testid="mock-select"]');
// Make sure select is not null
console.log(select);
selectOption(select, "new-value");
```

### "Dialog not opening when trigger clicked"

Make sure Dialog.Root wraps all Dialog components:

```javascript
// Correct structure
<MockDialog.Root>
  <MockDialog.Trigger>Open</MockDialog.Trigger>
  <MockDialog.Content>Content</MockDialog.Content>
</MockDialog.Root>
```

### "console.error output still appears"

Make sure `mockConsoleError()` is called in `beforeEach` and `reset()` in `afterEach`:

```javascript
beforeEach(() => {
  const { suppressExpectedError } = mockConsoleError();
  // ...
});

afterEach(() => {
  reset(); // Don't forget this
});
```

## Best Practices

1. **Setup mocks once**: Call `setupRadixMocks()` in a shared test setup file
2. **Suppress expected errors early**: In `beforeEach`, suppress errors you know will occur
3. **Use helpers for queries**: `getDialogTrigger()`, `getMockSelect()` instead of manual querySelector
4. **Check fidelity warnings**: If you see warnings about unsupported props, consider if the mock is sufficient
5. **Test integration**: For critical flows, write integration tests that don't use mocks
6. **Keep mocks simple**: If a component needs complex mock behavior, consider refactoring the component

## Related Files

- Component tests: `src/components/__tests__/`
- Page tests: `src/pages/__tests__/`
- Test setup: `.../vitest.config.js` or `jest.config.js`

## CI Notes

- If full `vitest` runs hit Node memory limits in CI, set `NODE_OPTIONS=--max-old-space-size=4096` for the test job.
- Baseline file for expected `console.error` noise: `tests/utils/console-error-baseline.json`.
