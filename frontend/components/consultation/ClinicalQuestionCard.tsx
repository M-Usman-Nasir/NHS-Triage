import { Check, ChevronRight, X } from 'lucide-react';
import type { AnswerValue } from '../../types/consultation';
import type { PathwayQuestion } from '../../lib/pathwayQuestions';

interface ClinicalQuestionCardProps {
  question: PathwayQuestion;
  answers: Record<string, AnswerValue>;
  error: string;
  onBooleanAnswer: (value: boolean) => void;
  onSelectAnswer: (value: string) => void;
  onMultiselectToggle: (value: string) => void;
  onTextAnswer: (value: string) => void;
  onNext: () => void;
}

export default function ClinicalQuestionCard({
  question,
  answers,
  error,
  onBooleanAnswer,
  onSelectAnswer,
  onMultiselectToggle,
  onTextAnswer,
  onNext,
}: ClinicalQuestionCardProps) {
  return (
    <div className="rounded-2xl border border-sky-200/60 bg-white/90 p-4 shadow-xl shadow-sky-900/10 backdrop-blur-sm sm:rounded-3xl sm:p-7">
      <h2 className="text-balance text-lg font-bold leading-snug text-slate-900 sm:text-xl">{question.text}</h2>

      <div className="mt-6">
        {question.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onBooleanAnswer(opt === 'Yes')}
                className={`touch-manipulation rounded-2xl border-2 py-4 text-base font-bold transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-5 ${
                  answers[question.id] === (opt === 'Yes')
                    ? opt === 'Yes'
                      ? 'border-primary bg-primary/12 text-primary shadow-md shadow-primary/10'
                      : 'border-slate-300 bg-slate-100 text-slate-800 shadow-inner'
                    : 'border-sky-200/80 bg-white/70 text-slate-500 hover:border-primary/35 hover:bg-sky-50/80'
                }`}
              >
                {opt === 'Yes' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Check className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <X className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                    No
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {question.type === 'select' && (
          <div className="space-y-2.5">
            {question.options?.map((opt) => {
              const selected = answers[question.id] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onSelectAnswer(opt)}
                  className={`touch-manipulation flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-sky-200/80 bg-white/80 text-slate-800 hover:border-primary/30 hover:bg-sky-50/80'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    {selected ? '✓' : ''}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${selected ? 'text-primary' : 'text-slate-400'}`} strokeWidth={2} aria-hidden />
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'multiselect' && question.options && (
          <div className="space-y-2.5">
            {question.options.map((opt) => {
              const selected = Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onMultiselectToggle(opt)}
                  className={`touch-manipulation flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-sky-200/80 bg-white/80 text-slate-800 hover:border-primary/30 hover:bg-sky-50/80'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-xs ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    {selected ? '✓' : ''}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'text' && (
          <textarea
            placeholder="Type here (or leave blank if not applicable)"
            value={typeof answers[question.id] === 'string' ? (answers[question.id] as string) : ''}
            onChange={(e) => onTextAnswer(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl border border-sky-200/90 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      {question.type !== 'boolean' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onNext}
            className="touch-manipulation flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Next
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          {!question.required && (
            <p className="mt-2 text-center text-xs text-slate-500">Optional — you can tap Next without selecting if you prefer.</p>
          )}
        </div>
      )}
    </div>
  );
}
