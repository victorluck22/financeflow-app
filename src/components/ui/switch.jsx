import React from "react";
import PropTypes from "prop-types";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils"; // clsx/cn para classes dinâmicas

const Switch = React.forwardRef(
  (
    {
      className = "",
      checked = false,
      disabled = false,
      id,
      "aria-label": ariaLabel,
      onToggle,
      ...props
    },
    ref
  ) => {
    const handleCheckedChange = async (newCheckedValue) => {
      try {
        if (onToggle && typeof onToggle === "function") {
          await onToggle(newCheckedValue);
        } else {
          console.log("⚠️ Nenhuma função onToggle foi passada como prop.");
        }
      } catch (error) {
        console.log("❌ Erro ao executar onToggle no Switch:", error);
      }
    };

    return (
      <SwitchPrimitives.Root
        id={id}
        ref={ref}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        checked={checked}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        aria-label={ariaLabel}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitives.Root>
    );
  }
);

Switch.displayName = "Switch";

Switch.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  "aria-label": PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired, // A função que você quer disparar no clique
};

export { Switch };
