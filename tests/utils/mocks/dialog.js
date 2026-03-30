/**
 * Mock implementation of Radix UI Dialog component for testing.
 * Provides open/close state management matching Radix behavior.
 */

import React from "react";

/**
 * MockDialogContext to manage dialog state across nested components.
 */
export const MockDialogContext = React.createContext({
  open: false,
  setOpen: () => {},
});

/**
 * Root Dialog component for managing overall dialog state.
 */
export const MockDialogRoot = ({ children, open = false, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const isControlled = onOpenChange !== undefined;

  const currentOpen = isControlled ? open : internalOpen;
  const setOpen = (newOpen) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <MockDialogContext.Provider value={{ open: currentOpen, setOpen }}>
      {children}
    </MockDialogContext.Provider>
  );
};

/**
 * Dialog trigger button that opens the dialog.
 */
export const MockDialogTrigger = React.forwardRef(
  ({ children, asChild, ...props }, ref) => {
    const { setOpen } = React.useContext(MockDialogContext);

    const handleClick = () => {
      setOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        ref,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        data-testid="dialog-trigger"
        {...props}
      >
        {children}
      </button>
    );
  },
);

MockDialogTrigger.displayName = "MockDialogTrigger";

/**
 * Dialog content wrapper and overlay.
 */
export const MockDialogContent = React.forwardRef(
  ({ children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(MockDialogContext);

    if (!open) return null;

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        setOpen(false);
      }
    };

    return (
      <>
        {/* Overlay backdrop */}
        <div
          data-testid="dialog-overlay"
          onClick={handleBackdropClick}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 50,
          }}
        />
        {/* Dialog content */}
        <div
          ref={ref}
          data-testid="dialog-content"
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 51,
            minWidth: "300px",
          }}
          {...props}
        >
          {children}
        </div>
      </>
    );
  },
);

MockDialogContent.displayName = "MockDialogContent";

/**
 * Dialog close button.
 */
export const MockDialogClose = React.forwardRef(
  ({ children, asChild, ...props }, ref) => {
    const { setOpen } = React.useContext(MockDialogContext);

    const handleClick = () => {
      setOpen(false);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        ref,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        data-testid="dialog-close"
        {...props}
      >
        {children || "×"}
      </button>
    );
  },
);

MockDialogClose.displayName = "MockDialogClose";

/**
 * Dialog title component.
 */
export const MockDialogTitle = React.forwardRef(
  ({ children, ...props }, ref) => (
    <div ref={ref} data-testid="dialog-title" {...props}>
      {children}
    </div>
  ),
);

MockDialogTitle.displayName = "MockDialogTitle";

/**
 * Dialog description component.
 */
export const MockDialogDescription = React.forwardRef(
  ({ children, ...props }, ref) => (
    <div ref={ref} data-testid="dialog-description" {...props}>
      {children}
    </div>
  ),
);

MockDialogDescription.displayName = "MockDialogDescription";

/**
 * Composite Dialog component for convenience.
 */
export const MockDialog = {
  Root: MockDialogRoot,
  Trigger: MockDialogTrigger,
  Content: MockDialogContent,
  Close: MockDialogClose,
  Title: MockDialogTitle,
  Description: MockDialogDescription,
};

/**
 * Warn if Dialog mock is used with unsupported props.
 */
export function checkDialogMockFidelity(props) {
  const unsupportedProps = [
    "modal",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "forceMount",
  ];
  const usedUnsupported = unsupportedProps.filter((prop) => prop in props);

  if (usedUnsupported.length > 0) {
    console.warn(
      `[MockDialog] Unsupported props detected: ${usedUnsupported.join(", ")}. ` +
        `Mock behavior may diverge from actual Radix Dialog.`,
    );
  }
}
