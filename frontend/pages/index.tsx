import Link from 'next/link';
import { DM_Serif_Display } from 'next/font/google';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Shield, Stethoscope, Users } from 'lucide-react';

const fontDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

type NavCard = {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  topBar: string;
  iconWrap: string;
  hoverGlow: string;
  cta: string;
};

const NAV_CARDS: NavCard[] = [
  {
    title: 'Patient',
    description: 'Open patient flow and consultation journey.',
    href: '/patients',
    Icon: Users,
    topBar: 'from-sky-400 via-blue-500 to-indigo-500',
    iconWrap:
      'bg-gradient-to-br from-sky-50 to-blue-100/90 text-blue-700 shadow-sm ring-1 ring-blue-200/70 group-hover:from-sky-100 group-hover:to-blue-100 group-hover:shadow-md group-hover:ring-blue-300/80',
    hoverGlow: 'group-hover:shadow-blue-500/12',
    cta: 'text-blue-700 group-hover:text-blue-800',
  },
  {
    title: 'Admin CRM',
    description: 'Manage cases, providers, tasks and reports.',
    href: '/admin_crm',
    Icon: Shield,
    topBar: 'from-indigo-400 via-violet-500 to-purple-600',
    iconWrap:
      'bg-gradient-to-br from-indigo-50 to-violet-100/90 text-indigo-800 shadow-sm ring-1 ring-indigo-200/70 group-hover:from-indigo-100 group-hover:to-violet-100 group-hover:shadow-md group-hover:ring-indigo-300/80',
    hoverGlow: 'group-hover:shadow-violet-500/12',
    cta: 'text-indigo-700 group-hover:text-indigo-900',
  },
  {
    title: 'Provider',
    description: 'Go to provider dashboard and actions.',
    href: '/providers',
    Icon: Stethoscope,
    topBar: 'from-teal-400 via-emerald-500 to-cyan-600',
    iconWrap:
      'bg-gradient-to-br from-emerald-50 to-teal-100/90 text-emerald-800 shadow-sm ring-1 ring-emerald-200/70 group-hover:from-emerald-100 group-hover:to-teal-100 group-hover:shadow-md group-hover:ring-emerald-300/80',
    hoverGlow: 'group-hover:shadow-emerald-500/12',
    cta: 'text-emerald-700 group-hover:text-emerald-900',
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-gradient-to-b from-sky-50 via-[#e8f2ff] to-slate-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='%232563eb' fill-opacity='0.06'%3E%3Cpath d='M22 10h4v12h12v4H26v12h-4V26H10v-4h12V10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,28rem)] bg-[radial-gradient(ellipse_85%_70%_at_50%_-5%,rgba(37,99,235,0.14),transparent_65%)]"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full min-w-0 max-w-5xl flex-1 items-start justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center sm:px-5 sm:py-14">
        <section className="w-full min-w-0 max-w-lg sm:max-w-none">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
            <h1
              className={`mb-3 text-balance text-[clamp(1.375rem,4.2vw+0.65rem,2.35rem)] leading-[1.12] tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.15] md:text-[2.35rem] ${fontDisplay.className}`}
            >
              Choose your workspace
            </h1>
            <p className="text-pretty px-1 text-sm leading-relaxed text-slate-600 sm:px-0 sm:text-base">
              Tap a card to continue to Patient, Admin CRM, or Provider area.
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-3 sm:gap-6">
            {NAV_CARDS.map(
              ({ title, description, href, Icon, topBar, iconWrap, hoverGlow, cta }) => (
                <Link
                  key={title}
                  href={href}
                  className={`group relative flex w-full min-w-0 min-h-[12.25rem] touch-manipulation flex-col overflow-hidden rounded-3xl border border-sky-200/55 bg-white/80 p-5 shadow-lg shadow-slate-900/[0.05] backdrop-blur-xl transition-all duration-300 ease-out active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[14rem] sm:p-7 sm:active:scale-100 hover:-translate-y-1 hover:border-sky-300/90 hover:bg-white/95 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 max-sm:focus-visible:ring-offset-0 ${hoverGlow}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${topBar}`}
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    aria-hidden
                  />

                  <span
                    className={`relative z-10 mb-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-[1.03] sm:mb-5 sm:h-14 sm:w-14 ${iconWrap}`}
                  >
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.75} />
                  </span>

                  <h2 className="relative z-10 text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                    {title}
                  </h2>
                  <p className="relative z-10 mt-1.5 flex-1 text-sm leading-relaxed text-slate-600 sm:mt-2 sm:text-[0.9375rem]">
                    {description}
                  </p>

                  <div className="relative z-10 mt-5 flex min-h-[3rem] items-center justify-between gap-3 border-t border-slate-200/70 pt-4 sm:mt-6 sm:min-h-0 sm:pt-5">
                    <span className={`min-w-0 truncate text-sm font-semibold transition-colors sm:text-sm ${cta}`}>
                      Continue
                    </span>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-600 shadow-inner transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md sm:h-10 sm:w-10">
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
