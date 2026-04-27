import { ArrowLeft, ChevronRight, ClipboardList, Stethoscope } from 'lucide-react';

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
  onGoBack,
}: ConsultationHeaderProps) {
  return (
    <header className="relative z-30 border-b border-primary-foreground/10 bg-brand-header/95 text-primary-foreground shadow-card-md backdrop-blur-md supports-[backdrop-filter]:bg-brand-header/90">
      <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onGoBack}
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm transition-all hover:border-primary-foreground/35 hover:bg-primary-foreground/20 hover:shadow-md active:scale-95 motion-reduce:transition-colors motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header sm:h-11 sm:w-11"
          aria-label="Go back"
        >
          <ArrowLeft
            className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none"
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">Aegis Health AI</p>
          <p className="truncate text-xs text-brand-header-subtle">{titlePathwayText}</p>
        </div>
        {pathwayCount > 1 && (
          <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary-foreground/95">
            Condition {pathwayIndex + 1}/{pathwayCount}
          </span>
        )}
        {wizardStep === 'preface' && (
          <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary-foreground/95">
            {prefaceIndex + 1}/{prefaceCount}
          </span>
        )}
        {wizardStep === 'clinical' && clinicalCurrentId && !clinicalSchemaLoading && (
          <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-primary-foreground/95">
            {clinicalProgressLabel}
          </span>
        )}
      </div>

      <div className="mx-auto max-w-xl px-4 pb-2.5 sm:px-5">
        <div className="flex gap-2">
          <div
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
              wizardStep === 'demographics'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary-foreground/10 text-primary-foreground/80'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
            <span className="truncate">About you</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 self-center text-primary-foreground/50" aria-hidden />
          <div
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
              wizardStep === 'preface' || wizardStep === 'clinical' || wizardStep === 'submitting'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary-foreground/10 text-primary-foreground/70'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
            <span className="truncate">Clinical questions</span>
          </div>
        </div>
      </div>

      {wizardStep === 'preface' && (
        <div className="h-1 bg-primary-foreground/15">
          <div
            className="h-1 rounded-r-full bg-primary-foreground transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${prefaceProgressPct}%` }}
          />
        </div>
      )}
      {wizardStep === 'clinical' && clinicalCurrentId && !clinicalSchemaLoading && (
        <div className="h-1 bg-primary-foreground/15">
          <div
            className="h-1 rounded-r-full bg-primary-foreground transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${clinicalProgressPct}%` }}
          />
        </div>
      )}
    </header>
  );
}
