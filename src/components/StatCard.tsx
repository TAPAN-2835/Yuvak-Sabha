import { cn } from "@/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "danger" | "gold" | "maroon";
  className?: string;
}) {
  const toneMap: Record<string, string> = {
    default: "text-saffron",
    success: "text-success",
    danger: "text-danger",
    gold: "text-gold",
    maroon: "text-maroon",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? <span className={cn("shrink-0", toneMap[tone])}>{icon}</span> : null}
      </div>
      <p className={cn("mt-2 font-numeric text-2xl font-semibold text-foreground")}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </motion.div>
  );
}
