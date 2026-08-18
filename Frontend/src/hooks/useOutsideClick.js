// src/hooks/useOutsideClick.js
import { useEffect } from 'react';

/**
 * Fires callback when user clicks outside the referenced element.
 * Usage:
 *   const ref = useRef();
 *   useOutsideClick(ref, () => setOpen(false));
 */
export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
};
