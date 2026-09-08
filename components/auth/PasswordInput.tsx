"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function PasswordInput({ label, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--brand-navy)]">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          className={cn(
            "min-h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-3 pr-12 text-base text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-blue)] focus:ring-4 focus:ring-blue-100",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-secondary)] transition hover:bg-blue-50 hover:text-[var(--brand-blue)]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}
