import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { __unsafe__resetBodyScrollLockForTests } from "@/hooks/useBodyScrollLock";

describe("Dialog mobile behavior", () => {
  afterEach(() => {
    cleanup();
    __unsafe__resetBodyScrollLockForTests();
  });

  it("locks body scroll and applies mobile-safe content classes", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
          </DialogHeader>
          <div>Modal content</div>
        </DialogContent>
      </Dialog>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    const content = screen.getByRole("dialog");
    expect(content).toHaveClass("max-h-[90dvh]");
    expect(content).toHaveClass("overflow-x-hidden");
    expect(content).toHaveClass("overflow-y-auto");
    expect(content).toHaveClass("overscroll-contain");
  });
});
