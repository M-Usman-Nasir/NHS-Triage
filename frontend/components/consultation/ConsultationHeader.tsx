import { ArrowLeft, ChevronRight, ClipboardList, Stethoscope } from 'lucide-react';
import StatusBadge from '../StatusBadge';

interface ConsultationHeaderProps {
  titlePathwayText: string;
  pathwayIndex: number;
  pathwayCount: number;
  wizardStep: 'demographics' | 'preface' | 'clinical' | 'submitting';
  prefaceIndex: number;
  prefaceCount: number;
  clinicalCurrentId: string | null;
  clinicalSchemaLoading: boolean;
  clinicalProgressLabel: string;
  prefaceProgressPct: number;
  clinicalProgressPct: number;
  branchModeLabel?: string;
  onGoBack: () => void;
}

export default function ConsultationHeader({
  titlePathwayText,
  pathwayIndex,
  pathwayCount,
  wizardStep,
  prefaceIndex,
  prefaceCount,
  clinicalCurrentId,
  clinicalSchemaLoading,
  clinicalProgressLabel,
  prefaceProgressPct,
  clinicalProgressPct,
  branchModeLabel,
  onGoBack,
}: ConsultationHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/70 bg-white/80 text-foreground shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:pb-2 sm:pt-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onGoBack}
            aria-label="Go back"
            className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/25 bg-white/90 text-primary shadow-sm transition active:scale-95 hover:border-primary/40 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </button>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-md ring-2 ring-primary/20 sm:h-11 sm:w-11"
            aria-hidden
          >
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight tracking-tight text-slate-900 sm:text-base">
              Care Path
            </p>
            <p className="truncate text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">{titlePathwayText}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {pathwayCount > 1 ? (
            <span className="rounded-full border border-sky-200/80 bg-white/90 px-2 py-1 text-[10px] font-semibold tabular-nums text-primary shadow-sm sm:text-[11px]">
              {pathwayIndex + 1}/{pathwayCount}
            </span>
          ) : null}
          {wizardStep === 'preface' ? (
            <span className="rounded-full border border-sky-200/80 bg-white/90 px-2 py-1 text-[10px] font-semibold tabular-nums text-primary shadow-sm sm:text-[11px]">
              {prefaceIndex + 1}/{prefaceCount}
            </span>
          ) : null}
          {wizardStep === 'clinical' && clinicalCurrentId && !clinicalSchemaLoading ? (
            <span className="rounded-full border border-sky-200/80 bg-white/90 px-2 py-1 text-[10px] font-semibold tabular-nums text-primary shadow-sm sm:text-[11px]">
              {clinicalProgressLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-3 pb-2.5 sm:px-4">
        {wizardStep === 'clinical' && branchModeLabel ? (
          <div className="mb-2 flex justify-end">
            <StatusBadge
              label={branchModeLabel}
              tone={branchModeLabel === 'NHS Pathway Logic' ? 'info' : 'warning'}
              className="text-[10px] font-semibold uppercase tracking-wide"
            />
          </div>
        ) : null}
        <div className="flex gap-1.5 sm:gap-2">
          <div
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-semibold transition-colors sm:text-xs ${
              wizardStep === 'demographics'
                ? 'border-primary/30 bg-primary/12 text-primary shadow-sm'
                : 'border-sky-200/70 bg-white/60 text-slate-600'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
            <span className="truncate">About you</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 self-center text-slate-400" strokeWidth={2} aria-hidden />
          <div
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-semibold transition-colors sm:text-xs ${
              wizardStep === 'preface' || wizardStep === 'clinical' || wizardStep === 'submitting'
                ? 'border-primary/30 bg-primary/12 text-primary shadow-sm'
                : 'border-sky-200/70 bg-white/60 text-slate-600'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
            <span className="truncate">Clinical</span>
          </div>
        </div>
      </div>

      {wizardStep === 'preface' ? (
        <div className="h-1 bg-sky-200/70">
          <div
            className="h-1 rounded-r-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${prefaceProgressPct}%` }}
          />
        </div>
      ) : null}
      {wizardStep === 'clinical' && clinicalCurrentId && !clinicalSchemaLoading ? (
        <div className="h-1 bg-sky-200/70">
          <div
            className="h-1 rounded-r-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${clinicalProgressPct}%` }}
          />
        </div>
      ) : null}
    </header>
  );
}
