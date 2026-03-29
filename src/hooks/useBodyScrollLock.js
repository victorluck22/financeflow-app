import { useEffect } from "react";

let bodyScrollLockCount = 0;
let savedOverflow = "";

const applyBodyScrollLock = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (bodyScrollLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  bodyScrollLockCount += 1;
};

const releaseBodyScrollLock = () => {
  if (typeof document === "undefined") {
    return;
  }

  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);

  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = savedOverflow;
  }
};

export const useBodyScrollLock = (enabled) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    applyBodyScrollLock();

    return () => {
      releaseBodyScrollLock();
    };
  }, [enabled]);
};

export const __unsafe__resetBodyScrollLockForTests = () => {
  bodyScrollLockCount = 0;
  savedOverflow = "";
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
};
