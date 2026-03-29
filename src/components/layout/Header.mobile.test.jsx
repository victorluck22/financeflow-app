import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Header from "@/components/layout/Header";

vi.mock("framer-motion", () => ({
  motion: {
    header: ({ children, ...props }) => <header {...props}>{children}</header>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">theme</button>,
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Ana" },
    users: [{ id: 1, name: "Ana" }],
    logout: vi.fn(),
    switchUser: vi.fn(),
  }),
}));

vi.mock("@/api/services/authService", () => ({
  logoutRequest: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, asChild, ...props }) => (
    <button {...props}>{children}</button>
  ),
  DropdownMenuLabel: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children, asChild }) => <div>{children}</div>,
  DropdownMenuRadioGroup: ({ children }) => <div>{children}</div>,
  DropdownMenuRadioItem: ({ children }) => <div>{children}</div>,
}));

describe("Header mobile portrait action", () => {
  it("keeps new transaction action visible with compact classes", () => {
    render(
      <MemoryRouter>
        <Header onNewTransaction={vi.fn()} onNewGoal={vi.fn()} />
      </MemoryRouter>,
    );

    const transactionButton = screen.getByRole("button", {
      name: /transação/i,
    });
    expect(transactionButton).toHaveClass("inline-flex");
    expect(transactionButton.className).not.toContain("hidden sm:inline-flex");
  });

  it("opens and closes hamburger panel with mobile links", () => {
    const { container } = render(
      <MemoryRouter>
        <Header onNewTransaction={vi.fn()} onNewGoal={vi.fn()} />
      </MemoryRouter>,
    );

    const openButton = screen.getByRole("button", { name: /abrir menu/i });
    fireEvent.click(openButton);

    expect(
      screen.getByRole("button", { name: /fechar menu/i }),
    ).toBeInTheDocument();

    const mobileNav = container.querySelector(
      "nav.container.flex.flex-col.py-2.pb-3",
    );
    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileNav).getByText("Investimentos")).toBeInTheDocument();
    expect(within(mobileNav).getByText("Financiamentos")).toBeInTheDocument();
    expect(within(mobileNav).getByText("Configurações")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /fechar menu/i }));
    expect(
      screen.getByRole("button", { name: /abrir menu/i }),
    ).toBeInTheDocument();
  });
});
