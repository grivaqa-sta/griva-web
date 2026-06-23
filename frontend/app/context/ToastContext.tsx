"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShoppingCart,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info" | "cart";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    cart: (message: string, duration?: number) => void;
  };
  /** Confirm dialog replacement — returns a Promise<boolean> */
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Icon map & color map ─────────────────────────────────────────────────────
const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    text: string;
    accent: string;
    progressBar: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="h-[18px] w-[18px]" />,
    bg: "bg-white",
    border: "border-green-200",
    text: "text-green-700",
    accent: "text-green-500",
    progressBar: "bg-green-500",
  },
  error: {
    icon: <XCircle className="h-[18px] w-[18px]" />,
    bg: "bg-white",
    border: "border-red-200",
    text: "text-red-700",
    accent: "text-red-500",
    progressBar: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-[18px] w-[18px]" />,
    bg: "bg-white",
    border: "border-amber-200",
    text: "text-amber-700",
    accent: "text-amber-500",
    progressBar: "bg-amber-500",
  },
  info: {
    icon: <Info className="h-[18px] w-[18px]" />,
    bg: "bg-white",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "text-blue-500",
    progressBar: "bg-blue-500",
  },
  cart: {
    icon: <ShoppingCart className="h-[18px] w-[18px]" />,
    bg: "bg-white",
    border: "border-orange-200",
    text: "text-orange-700",
    accent: "text-orange-500",
    progressBar: "bg-orange-500",
  },
};

// ─── Toast Item Component ─────────────────────────────────────────────────────
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = TOAST_CONFIG[toast.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 ${config.bg} ${config.border} border rounded-2xl px-4 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm overflow-hidden min-w-[300px] max-w-[420px] pointer-events-auto`}
    >
      {/* Accent icon */}
      <span className={`${config.accent} mt-0.5 shrink-0`}>{config.icon}</span>

      {/* Message */}
      <p className={`${config.text} text-[13px] font-semibold leading-snug flex-1 pr-4`}>
        {toast.message}
      </p>

      {/* Dismiss X */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 right-0 h-[3px] ${config.progressBar} origin-left rounded-b-2xl`}
      />
    </motion.div>
  );
}

// ─── Confirm Dialog Component ─────────────────────────────────────────────────
function ConfirmDialog({
  message,
  title,
  onConfirm,
  onCancel,
}: {
  message: string;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[90%] max-w-[380px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed pl-[46px]">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 shadow-md shadow-orange-500/15 transition-all cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const [confirmState, setConfirmState] = useState<{
    message: string;
    title: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration: number = 4000) => {
      const id = `toast-${++idCounter}-${Date.now()}`;
      const toast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev.slice(-4), toast]); // max 5 visible toasts

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  const toastApi: ToastContextValue["toast"] = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur ?? 5000),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    cart: (msg, dur) => addToast(msg, "cart", dur ?? 3000),
  };

  const confirmApi = useCallback(
    (message: string, title: string = "Confirm Action") => {
      return new Promise<boolean>((resolve) => {
        setConfirmState({ message, title, resolve });
      });
    },
    []
  );

  const handleConfirm = () => {
    confirmState?.resolve(true);
    setConfirmState(null);
  };

  const handleCancel = () => {
    confirmState?.resolve(false);
    setConfirmState(null);
  };

  return (
    <ToastContext.Provider value={{ toast: toastApi, confirm: confirmApi }}>
      {children}

      {/* Toast Container — top-right */}
      <div className="fixed top-4 right-4 z-[100001] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmState && (
          <ConfirmDialog
            message={confirmState.message}
            title={confirmState.title}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
