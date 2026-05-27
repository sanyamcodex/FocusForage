import { createContext, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = (message, type = "default") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  };
  const value = useMemo(() => ({ toast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid gap-3">
        {toasts.map((item) => (
          <div key={item.id} className="glass flex w-80 items-start justify-between gap-3 rounded-lg border p-4 shadow-lg">
            <p className="text-sm">{item.message}</p>
            <button onClick={() => setToasts((items) => items.filter((toastItem) => toastItem.id !== item.id))}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

