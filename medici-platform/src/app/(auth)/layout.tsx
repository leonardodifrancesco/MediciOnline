import Link from "next/link";
import type { ReactNode } from "react";
import { Stethoscope } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper-dim">
      <header className="container-app py-6">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-lg text-ink">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
            <Stethoscope className="size-5" aria-hidden="true" />
          </span>
          MediTrova
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
