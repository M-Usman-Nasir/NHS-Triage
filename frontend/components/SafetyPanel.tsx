import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface SafetyPanelProps {
  title: string;
  children: ReactNode;
  level?: 'warning' | 'danger';
}

export default function SafetyPanel({ title, children, level = 'warning' }: SafetyPanelProps) {
  const classes =
    level === 'danger'
      ? 'border-red-300 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-900';
  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
        <TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        {title}
      </h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
