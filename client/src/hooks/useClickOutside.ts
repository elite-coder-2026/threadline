import { useEffect } from 'react';
import type { RefObject } from 'react';

// Calls `handler` when a mousedown/touchstart lands outside `ref`.
// Used by the custom Dropdown to close itself (no native <select>).
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  active = true,
): void => {
  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: MouseEvent | TouchEvent): void => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [ref, handler, active]);
};
