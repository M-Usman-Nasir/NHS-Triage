import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

type LegalLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function LegalLayout({ title, description, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/[0.06] via-background to-muted/60">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Home
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{title}</p>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 pb-16">{children}</main>
    </div>
  );
}
