// src/hooks/useModal.js
import { useState, useCallback } from 'react';

/**
 * useModal — centralised open/close + optional data payload.
 *
 * Usage:
 *   const { isOpen, data, open, close } = useModal();
 *   open(patient)          // opens with data
 *   open()                 // opens without data (e.g. Create form)
 *   close()                // closes + clears data
 *
 *   <ConfirmModal isOpen={isOpen} onClose={close} data={data} />
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data,   setData]   = useState(null);

  const open  = useCallback((payload = null) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Small delay before clearing data so close animation plays
    setTimeout(() => setData(null), 200);
  }, []);

  return { isOpen, data, open, close };
};
