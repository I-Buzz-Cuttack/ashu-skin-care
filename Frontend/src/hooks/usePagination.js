// src/hooks/usePagination.js
import { useState } from 'react';

/**
 * usePagination — manages page, limit, and helpers.
 *
 * Usage:
 *   const { page, limit, setPage, setLimit, resetPage } = usePagination();
 *   const { data } = useGetPatientsQuery({ page, limit });
 */
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page,  setPage]  = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const resetPage = () => setPage(1);

  const goToNext = (totalPages) => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const goToPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  return { page, limit, setPage, setLimit, resetPage, goToNext, goToPrev };
};
