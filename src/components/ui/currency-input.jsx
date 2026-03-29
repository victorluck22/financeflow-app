import React, { useState, useEffect } from "react";
import { Input } from "./input";

/**
 * Input com máscara de moeda brasileira (R$)
 * Formato: #####,## (sem pontos de milhar)
 */
export const CurrencyInput = React.forwardRef(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    // Atualiza a exibição quando a prop value muda externamente
    useEffect(() => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== 0
      ) {
        // Converte o valor para formato #####,##
        const formatted = parseFloat(value).toFixed(2).replace(".", ",");
        setDisplayValue(formatted);
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e) => {
      let inputValue = e.target.value;

      // Remove tudo que não é número
      inputValue = inputValue.replace(/\D/g, "");

      // Se estiver vazio, notifica 0
      if (!inputValue) {
        setDisplayValue("");
        onChange?.(0);
        return;
      }

      // Trabalha com centavos: divide por 100 e formata
      const numValue = parseInt(inputValue, 10);
      const formatted = (numValue / 100).toFixed(2).replace(".", ",");

      setDisplayValue(formatted);

      // Notifica o valor numérico para o parent
      onChange?.(numValue / 100);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          R$
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          className={`pl-10 ${props.className || ""}`}
        />
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
