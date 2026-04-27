import { AlertTriangle, Info } from 'lucide-react';
import type { ReactNode } from 'react';

type InlineNoticeTone = 'info' | 'warning' | 'danger';

interface InlineNoticeProps {
  title?: string;
  children: ReactNode;
  tone?: InlineNoticeTone;
  className?: string;
}

const TONE_CLASS: Record<InlineNoticeTone, string> = {
  info: 'border-primary/20 bg-primary/[0.06] text-primary',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-800',
};

export default function InlineNotice({ title, children, tone = 'info', className = '' }: InlineNoticeProps) {
  const Icon = tone === 'danger' ? AlertTriangle : Info;
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${TONE_CLASS[tone]} ${className}`}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <div className="min-w-0">
          {title ? <p className="text-sm font-semibold mb-1">{title}</p> : null}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
