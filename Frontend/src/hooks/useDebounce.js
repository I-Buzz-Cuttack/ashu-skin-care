// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Delays updating a value until after the user stops typing.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(search, 400);
 *   const { data } = useGetPatientsQuery({ search: debouncedSearch });
 */
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
