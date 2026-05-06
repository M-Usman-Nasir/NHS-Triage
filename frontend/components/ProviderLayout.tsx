import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';

interface ProviderLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const NAV_ITEMS: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: '/providers', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/providers/patients', label: 'Patient Demographics', Icon: Users },
  { href: '/providers/cases', label: 'Symptoms & Responses', Icon: ClipboardCheck },
  { href: '/providers/decisioning', label: 'Triage Decisioning', Icon: Activity },
  { href: '/providers/pharmacy_referrals', label: 'Pharmacy Referrals', Icon: Stethoscope },
  { href: '/providers/overrides', label: 'Overrides', Icon: FileText },
  { href: '/providers/audit', label: 'Audit Log', Icon: ShieldCheck },
  { href: '/providers/profile', label: 'Profile', Icon: User },
  { href: '/providers/settings', label: 'Settings', Icon: Settings },
];

const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

export default function ProviderLayout({ children, title, subtitle }: ProviderLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const isActive = (href: string) => {
    if (href === '/providers') return router.pathname === '/providers';
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex w-56 flex-col flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-xs">P</span>
            </div>
            <div>
              <p className="text-sidebar-foreground font-bold text-sm leading-tight">Aegis Health</p>
              <p className="text-sidebar-muted text-xs">Provider Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
              <span className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                isActive(href) ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}>
                <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                {label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground text-xs font-bold">PV</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sidebar-foreground text-xs font-medium truncate">Dr. Provider User</p>
              <p className="text-sidebar-muted text-xs truncate">provider@aegishealth.ai</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-card">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted flex-shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">{title}</h1>
            {subtitle ? <p className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p> : null}
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      {sidebarOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="relative w-72 flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-2xl">
            <div className="px-5 py-5 border-b border-sidebar-border">
              <p className="text-sidebar-foreground font-bold">Provider Portal</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="block rounded-xl" onClick={() => setSidebarOpen(false)}>
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                    isActive(href) ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}>
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {label}
                  </span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 shadow-card-md safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {BOTTOM_NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="min-w-0 flex-1 max-w-[5.5rem]">
              <span className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl cursor-pointer transition-all min-w-0 ${
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <Icon className={`h-6 w-6 shrink-0 ${isActive(href) ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.65} aria-hidden />
                <span className={`text-xs font-medium leading-tight truncate ${isActive(href) ? 'text-primary' : 'text-muted-foreground'}`}>{label.split(' ')[0]}</span>
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
