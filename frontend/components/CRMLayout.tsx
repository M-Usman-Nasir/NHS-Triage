import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ChartColumn,
  FolderKanban,
  Hospital,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Shield,
  Users,
} from 'lucide-react';

interface CRMLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const NAV_ITEMS: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: '/crm',                label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/crm/patients',       label: 'Patients', Icon: Users },
  { href: '/crm/cases',          label: 'Cases', Icon: FolderKanban },
  { href: '/crm/tasks',          label: 'Tasks', Icon: ListTodo },
  { href: '/crm/communications', label: 'Comms', Icon: MessageSquare },
  { href: '/crm/providers',      label: 'Providers', Icon: Hospital },
  { href: '/crm/reports',        label: 'Reports', Icon: ChartColumn },
  { href: '/admin/dashboard',   label: 'Admin', Icon: Shield },
];

const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

export default function CRMLayout({ children, title, subtitle }: CRMLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/crm') return router.pathname === '/crm';
    if (href === '/admin/dashboard') return router.pathname.startsWith('/admin');
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      <aside className="hidden lg:flex w-56 flex-col flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-xs">A</span>
            </div>
            <div>
              <p className="text-sidebar-foreground font-bold text-sm leading-tight">Aegis Health</p>
              <p className="text-sidebar-muted text-xs">CRM</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link key={href} href={href}>
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
              <span className="text-sidebar-primary-foreground text-xs font-bold">AU</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sidebar-foreground text-xs font-medium truncate">Dr. Admin User</p>
              <p className="text-sidebar-muted text-xs truncate">admin@aegishealth.ai</p>
            </div>
          </div>
          <Link href="/">
            <span className="mt-3 flex items-center gap-2 text-sidebar-muted hover:text-sidebar-foreground text-xs cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Platform
            </span>
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="relative w-72 flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-2xl">
            <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold text-sm">A</span>
                </div>
                <div>
                  <p className="text-sidebar-foreground font-bold">Aegis Health</p>
                  <p className="text-sidebar-muted text-xs">CRM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-sidebar-muted hover:text-sidebar-foreground text-2xl w-8 h-8 flex items-center justify-center rounded-lg"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ href, label, Icon }) => (
                <Link key={href} href={href}>
                  <span
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                      isActive(href) ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {label}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground text-sm font-bold">AU</span>
                </div>
                <div>
                  <p className="text-sidebar-foreground text-sm font-medium">Dr. Admin User</p>
                  <p className="text-sidebar-muted text-xs">admin@aegishealth.ai</p>
                </div>
              </div>
              <Link href="/"><span className="text-sidebar-muted text-sm hover:text-sidebar-foreground">← Back to Platform</span></Link>
            </div>
          </aside>
        </div>
      )}

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

          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">A</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" aria-hidden />
              Online
            </span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center lg:hidden">
              <span className="text-primary-foreground text-xs font-bold">AU</span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 shadow-card-md safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {BOTTOM_NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href}>
              <span className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl cursor-pointer transition-all min-w-0 ${
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <Icon className={`h-6 w-6 shrink-0 ${isActive(href) ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.65} aria-hidden />
                <span className={`text-xs font-medium leading-tight truncate ${isActive(href) ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {isActive(href) && (
                  <span className="w-1 h-1 bg-primary rounded-full" aria-hidden />
                )}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
