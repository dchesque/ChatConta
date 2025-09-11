import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

export const toast = {
  success: (message: string) => addToast('success', message),
  error: (message: string) => addToast('error', message),
  warning: (message: string) => addToast('warning', message),
  info: (message: string) => addToast('info', message)
};

const addToast = (type: Toast['type'], message: string) => {
  // Use crypto for secure ID generation
  const randomBytes = new Uint8Array(9);
  crypto.getRandomValues(randomBytes);
  const id = Array.from(randomBytes, byte => byte.toString(36)).join('').substr(0, 9);
  const newToast = { id, type, message };
  toasts = [newToast, ...toasts];
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 5000);
};

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useState(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  });

  const removeToast = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  };

  const getToastStyles = (type: Toast['type']) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-orange-50 border-orange-200 text-orange-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return styles[type];
  };

  const getToastIcon = (type: Toast['type']) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info
    };
    return icons[type];
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {currentToasts.map(toast => {
          const Icon = getToastIcon(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-center space-x-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm min-w-[300px] animate-fade-in ${getToastStyles(toast.type)}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1 font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};