import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

const fieldClass =
  "min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-base text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-blue)] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400";

export function FormField({ label, hint, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--brand-navy)]">{label}</span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-[var(--text-secondary)]">{hint}</span> : null}
    </label>
  );
}

export function AppInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function AppTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-28 resize-none", className)} {...props} />;
}

export function AppSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select className={cn(fieldClass, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
        aria-hidden="true"
      />
    </span>
  );
}

