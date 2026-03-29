import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(
        ({
          id,
          title,
          description,
          action,
          className,
          style,
          dismiss,
          ...props
        }) => {
          const toastStyle = className
            ? (() => {
                if (className.includes("bg-green")) {
                  return {
                    backgroundColor: "#22c55e",
                    color: "white",
                    ...style,
                  };
                }
                return style;
              })()
            : style;

          return (
            <Toast key={id} className={className} style={toastStyle} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          );
        },
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
