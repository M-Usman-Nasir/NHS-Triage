import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface CRMLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const NAV_ITEMS = [
  { href: '/crm',                label: 'Dashboard',      icon: '📊', mobileIcon: '📊' },
  { href: '/crm/patients',       label: 'Patients',       icon: '👥', mobileIcon: '👥' },
  { href: '/crm/cases',          label: 'Cases',          icon: '📋', mobileIcon: '📋' },
  { href: '/crm/tasks',          label: 'Tasks',          icon: '✅', mobileIcon: '✅' },
  { href: '/crm/communications', label: 'Comms',          icon: '💬', mobileIcon: '💬' },
  { href: '/crm/providers',      label: 'Providers',      icon: '🏥', mobileIcon: '🏥' },
  { href: '/crm/reports',        label: 'Reports',        icon: '📈', mobileIcon: '📈' },
];

// Bottom nav shows only first 5 items on mobile
const BOTTOM_NAV = NAV_ITEMS.slice(0, 5);

export default function CRMLayout({ children, title, subtitle }: CRMLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/crm') return router.pathname === '/crm';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 bg-gray-900 flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Aegis Health</p>
              <p className="text-gray-400 text-xs">CRM</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                isActive(item.href) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
                <span>{item.icon}</span>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">AU</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">Dr. Admin User</p>
              <p className="text-gray-400 text-xs truncate">admin@aegishealth.ai</p>
            </div>
          </div>
          <Link href="/">
            <span className="mt-3 flex items-center gap-2 text-gray-500 hover:text-gray-300 text-xs cursor-pointer">
              ← Platform
            </span>
          </Link>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          {/* Drawer */}
          <aside className="relative w-72 bg-gray-900 flex flex-col h-full shadow-2xl">
            <div className="px-5 py-5 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <p className="text-white font-bold">Aegis Health</p>
                  <p className="text-gray-400 text-xs">CRM</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center">
                ×
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                      isActive(item.href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AU</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Dr. Admin User</p>
                  <p className="text-gray-400 text-xs">admin@aegishealth.ai</p>
                </div>
              </div>
              <Link href="/"><span className="text-gray-400 text-sm hover:text-white">← Back to Platform</span></Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-800 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 truncate hidden sm:block">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Online
            </span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center lg:hidden">
              <span className="text-white text-xs font-bold">AU</span>
            </div>
          </div>
        </header>

        {/* Scrollable content — add bottom padding on mobile for tab bar */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="flex items-center justify-around px-1 py-1 safe-area-bottom">
          {BOTTOM_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl cursor-pointer transition-all min-w-0 ${
                isActive(item.href) ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <span className="text-xl leading-none">{item.mobileIcon}</span>
                <span className={`text-xs font-medium leading-tight truncate ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {isActive(item.href) && (
                  <span className="w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
