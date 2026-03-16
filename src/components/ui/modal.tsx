"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_28px_100px_-36px_rgba(15,23,42,0.55)]",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-2xl font-semibold text-slate-950">
              {title}
            </h2>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div> : null}
      </div>
    </div>
  );
}
