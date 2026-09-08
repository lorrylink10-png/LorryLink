import Image from "next/image";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[var(--background)] px-5 py-6 shadow-[0_0_60px_rgb(15_39_71_/_10%)]">
      <section className="flex flex-1 flex-col justify-center pb-6 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="mb-7 flex justify-center">
          <div className="relative h-20 w-32">
            <Image
              src="/logo.png"
              alt="Lorry Link"
              fill
              className="object-contain"
              priority
              sizes="128px"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-6 space-y-2 text-center">
            <h1 className="text-2xl font-bold text-[var(--brand-navy)]">{title}</h1>
            {subtitle ? (
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
