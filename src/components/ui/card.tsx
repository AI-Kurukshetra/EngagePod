import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}
