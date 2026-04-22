import type { LucideIcon } from 'lucide-react';
import { Home, Pill, Stethoscope, TriangleAlert, Siren } from 'lucide-react';

/** Shared Lucide icons for triage outcomes (patient result, CRM, reports). */
export const TRIAGE_OUTCOME_ICON: Record<string, LucideIcon> = {
  self_care: Home,
  pharmacy: Pill,
  gp: Stethoscope,
  urgent_care: TriangleAlert,
  emergency_999: Siren,
};

export function TriageOutcomeIcon({
  outcome,
  className,
  strokeWidth = 1.65,
}: {
  outcome: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = TRIAGE_OUTCOME_ICON[outcome] ?? Pill;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
