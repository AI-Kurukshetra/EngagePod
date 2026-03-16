import Link from "next/link";
import type { Route } from "next";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  href?: Route;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-lg shadow-sky-300/30 hover:bg-[var(--color-primary-strong)]",
  secondary:
    "bg-white/80 text-slate-900 ring-1 ring-white/70 hover:bg-white backdrop-blur-sm",
  ghost: "bg-transparent text-slate-700 hover:bg-white/60",
};

function getButtonClasses(variant: ButtonVariant, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );
}

export function Button({
  className,
  children,
  variant = "primary",
  icon,
  href,
  ...props
}: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={getButtonClasses(variant, className)}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={getButtonClasses(variant, className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
