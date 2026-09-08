import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

type AppHeaderProps = {
  roleLabel: string;
};

export function AppHeader({ roleLabel }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="relative h-12 w-28" aria-label="Lorry Link home">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
            alt="Lorry Link"
            fill
            className="object-contain"
            priority
            sizes="144px"
          />
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1">
          <span className="max-w-24 truncate text-xs font-semibold text-[var(--text-secondary)]">
            {roleLabel}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
            <User size={16} aria-hidden="true" />
          </span>
        </div>
      </div>
    </header>
  );
}

