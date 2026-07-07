import { useEffect, useState } from "react";

/**
 * Returns `true` shortly after `open` becomes true (10ms delay),
 * allowing CSS transitions to play. Resets to false immediately when `open` is false.
 */
export function useDelayedVisibility(open) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, [open]);

  return visible;
}
