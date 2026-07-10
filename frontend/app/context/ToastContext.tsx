"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

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
    label: string;
    icon: React.ReactNode;
    border: string;
    accent: string;
    progressBar: string;
  }
> = {
  success: {
    label: "Success",
    icon: <CheckCircle2 className="h-4 w-4" />,
    border: "border-l-emerald-500",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    progressBar: "bg-emerald-500",
  },
  error: {
    label: "Error",
    icon: <XCircle className="h-4 w-4" />,
    border: "border-l-rose-500",
    accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    progressBar: "bg-rose-500",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="h-4 w-4" />,
    border: "border-l-amber-500",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    progressBar: "bg-amber-500",
  },
  info: {
    label: "Notice",
    icon: <Info className="h-4 w-4" />,
    border: "border-l-sky-500",
    accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    progressBar: "bg-sky-500",
  },
  cart: {
    label: "Cart Update",
    icon: <ShoppingCart className="h-4 w-4" />,
    border: "border-l-[#FF6A00]",
    accent: "text-[#FF6A00] bg-[#FF6A00]/10 border-[#FF6A00]/20",
    progressBar: "bg-[#FF6A00]",
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
      initial={{ opacity: 0, x: -60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`relative flex items-start gap-4 bg-[#0C0C0E]/95 border border-white/[0.08] backdrop-blur-md border-l-[3px] ${config.border} rounded-none px-5 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden min-w-[340px] max-w-[400px] pointer-events-auto`}
    >
      {/* Icon Badge */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-none border ${config.accent}`}>
        {config.icon}
      </div>

      {/* Content Stack */}
      <div className="flex-1 pr-4">
        <span className="block text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-0.5">
          {config.label}
        </span>
        <p className="text-[13px] font-medium text-gray-100 leading-normal">
          {toast.message}
        </p>
        {toast.type === "cart" && (
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold tracking-wider text-[#FF6A00] hover:text-orange-400 uppercase transition-colors duration-200 pointer-events-auto"
          >
            View Cart
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Dismiss X */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${config.progressBar} origin-left rounded-none`}
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
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-[4px] pointer-events-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="bg-[#0C0C0E]/95 border border-white/[0.08] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] rounded-none w-[90%] max-w-[380px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-none bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed pl-[46px]">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-none text-xs font-bold text-gray-300 bg-white/[0.02] border border-white/10 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-none text-xs font-bold text-white bg-[#FF6A00] hover:bg-orange-600 active:bg-orange-700 transition-all cursor-pointer"
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

  const toastsRef = useRef<Toast[]>([]);
  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

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
      // Prevent displaying the same toast message multiple times concurrently
      if (toastsRef.current.some((t) => t.message === message && t.type === type)) {
        return;
      }
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

      {/* Toast Container — bottom-left */}
      <div className="fixed bottom-4 left-4 z-[100001] flex flex-col-reverse gap-2.5 pointer-events-none">
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
