// src/components/modals/Modal/Modal.jsx
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',

};

// const Modal = ({
//   isOpen, onClose, title, subtitle,
//   children, footer, size = 'md', closeOnOverlay = true,
// }) => {
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  headerClassName = "",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={[
          "relative w-full animate-pop overflow-hidden rounded-3xl shadow-2xl",
          "bg-white dark:bg-slate-900",
          "border border-slate-100 dark:border-slate-700/60",
          SIZES[size] ?? SIZES.md,
        ].join(" ")}
      >
        {/* ================= HEADER ================= */}
        {(title || onClose) && (
          <div
            className={[
              "flex items-start justify-between gap-4 px-6 pt-4 pb-2",
              "bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 text-white border-none rounded-t-3xl",
              headerClassName,
            ].join(" ")}
          >
            <div>
              {title && (
                <h3 className="font-semibold text-inherit text-m leading-tight">
                  {title}
                </h3>
              )}

              {subtitle && (
                <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>
              )}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl shrink-0 -mt-1 -mr-1 transition-all
                           text-white hover:text-white/80 hover:bg-white/10"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* ================= BODY ================= */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* ================= FOOTER ================= */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2.5 px-6 py-4
                       border-t border-slate-100 dark:border-slate-700/60
                       bg-slate-50 dark:bg-slate-800/50"
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
