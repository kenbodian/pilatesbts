import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    return addToast('success', message);
  }, [addToast]);

  const error = useCallback((message: string) => {
    return addToast('error', message);
  }, [addToast]);

  const warning = useCallback((message: string) => {
    return addToast('warning', message);
  }, [addToast]);

  const info = useCallback((message: string) => {
    return addToast('info', message);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
