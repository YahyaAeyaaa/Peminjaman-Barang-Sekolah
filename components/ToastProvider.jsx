'use client';

import { createContext, useContext, useState } from 'react';
import { Toast } from './toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (type, title, description, duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, description, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (title, description, duration) => showToast('success', title, description, duration),
    warning: (title, description, duration) => showToast('warning', title, description, duration),
    error: (title, description, duration) => showToast('danger', title, description, duration),
    info: (title, description, duration) => showToast('success', title, description, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container - Multiple toasts stacked */}
      {toasts.map((toastItem, index) => (
        <div
          key={toastItem.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 140}px`,
            right: '20px',
            zIndex: 9999 + index,
            pointerEvents: 'auto',
          }}
        >
          <Toast
            type={toastItem.type}
            title={toastItem.title}
            description={toastItem.description}
            duration={toastItem.duration}
            onClose={() => removeToast(toastItem.id)}
            position="top-right"
          />
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

