import Image from "next/image";
import Link from "next/link";
import { Package, Truck } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { AppButton } from "@/components/ui/AppButton";

export default function SplashPage() {
  return (
    <AuthGate mode="public">
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--surface)] px-6 py-8 shadow-[0_0_60px_rgb(15_39_71_/_10%)]">
        <section className="flex flex-1 flex-col items-center justify-center gap-8 pb-8 pt-[calc(env(safe-area-inset-top)+24px)] text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="relative h-28 w-36">
              <Image
                src="/logo.png"
                alt="Lorry Link"
                fill
                className="object-contain"
                priority
                sizes="144px"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight text-[var(--brand-navy)]">
                Move parcels. Find lorries.
              </h1>
              <p className="mx-auto max-w-72 text-base leading-7 text-[var(--text-secondary)]">
                Simple parcel pickups and lorry connections for everyday movement across India.
              </p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <AppButton href="/register" className="w-full">
              Get Started
            </AppButton>
            <AppButton href="/login" variant="outline" className="w-full">
              Sign In
            </AppButton>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/register"
                className="touch-target flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-blue)]"
              >
                <Package size={18} aria-hidden="true" />
                Customer
              </Link>
              <Link
                href="/register"
                className="touch-target flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold text-[var(--brand-navy)] transition hover:border-[var(--brand-blue)]"
              >
                <Truck size={18} aria-hidden="true" />
                Lorry Driver
              </Link>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
