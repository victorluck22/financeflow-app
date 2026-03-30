/**
 * Console error spy utilities for testing.
 * Allows controlling console.error in tests: suppress expected errors, detect unexpected ones.
 */

let errorSpy = null;
let suppressedPatterns = [];
let errorHistory = [];

/**
 * Setup console.error spy and return control functions.
 * Returns: { expect, reset, suppressExpectedError }
 */
export function mockConsoleError() {
  // Store original console.error
  const originalError = console.error;
  errorHistory = [];
  suppressedPatterns = [];

  // Create spy that tracks calls
  errorSpy = jest.fn((message, ...args) => {
    // Check if this error matches a suppressed pattern
    const messageStr = String(message);
    const isSuppressed = suppressedPatterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(messageStr);
      }
      return messageStr.includes(pattern);
    });

    if (!isSuppressed) {
      errorHistory.push({ message, args });
    }

    // Don't call original - we're suppressing
  });

  // Replace console.error with spy
  console.error = errorSpy;

  // Return control functions
  return {
    expect: (pattern, count = 1) => expectConsoleError(pattern, count),
    reset: () => resetConsoleError(originalError),
    suppressExpectedError: (pattern) => suppressExpectedError(pattern),
  };
}

/**
 * Assert that console.error was called with a specific pattern.
 */
export function expectConsoleError(pattern, expectedCount = 1) {
  if (!errorSpy) {
    throw new Error(
      "mockConsoleError() must be called before expectConsoleError()",
    );
  }

  const matchingCalls = errorHistory.filter((entry) => {
    const messageStr = String(entry.message);
    if (pattern instanceof RegExp) {
      return pattern.test(messageStr);
    }
    return messageStr.includes(pattern);
  });

  const actualCount = matchingCalls.length;

  if (actualCount !== expectedCount) {
    throw new Error(
      `Expected console.error to be called ${expectedCount} time(s) with pattern "${pattern}", ` +
        `but was called ${actualCount} time(s). ` +
        `Matching calls: ${matchingCalls.map((c) => c.message).join("; ")}`,
    );
  }
}

/**
 * Suppress console.error calls matching a pattern.
 * If a console.error is called that doesn't match any pattern, test fails.
 */
export function suppressExpectedError(pattern) {
  if (!errorSpy) {
    throw new Error(
      "mockConsoleError() must be called before suppressExpectedError()",
    );
  }

  suppressedPatterns.push(pattern);
}

/**
 * Reset console.error to original and clear spy state.
 */
export function resetConsoleError(originalError) {
  if (originalError) {
    console.error = originalError;
  }
  errorSpy = null;
  suppressedPatterns = [];
  errorHistory = [];
}

/**
 * Create a spy without capturing - just replace console.error with a mock.
 * Useful when you want to test that console.error is NOT called.
 */
export function createConsoleErrorSpy() {
  const calls = [];
  const original = console.error;

  console.error = jest.fn((...args) => {
    calls.push(args);
  });

  return {
    calls,
    reset: () => {
      console.error = original;
    },
    wasCalled: () => calls.length > 0,
    wasCalledWith: (pattern) => {
      const messageStr = calls.map((c) => c.join(" ")).join(" ");
      if (pattern instanceof RegExp) {
        return pattern.test(messageStr);
      }
      return messageStr.includes(pattern);
    },
  };
}

/**
 * Utility to verify console.error was not called (or not called with pattern).
 */
export function expectNoConsoleError(pattern) {
  if (!errorSpy) {
    throw new Error(
      "mockConsoleError() must be called before expectNoConsoleError()",
    );
  }

  if (pattern === undefined) {
    // No pattern: ensure NO console.error calls at all
    if (errorHistory.length > 0) {
      throw new Error(
        `Expected no console.error calls, but ${errorHistory.length} were made: ` +
          errorHistory.map((e) => e.message).join("; "),
      );
    }
  } else {
    // With pattern: ensure console.error NOT called with pattern
    const matchingCalls = errorHistory.filter((entry) => {
      const messageStr = String(entry.message);
      if (pattern instanceof RegExp) {
        return pattern.test(messageStr);
      }
      return messageStr.includes(pattern);
    });

    if (matchingCalls.length > 0) {
      throw new Error(
        `Expected console.error NOT to be called with pattern "${pattern}", ` +
          `but was called ${matchingCalls.length} time(s)`,
      );
    }
  }
}
