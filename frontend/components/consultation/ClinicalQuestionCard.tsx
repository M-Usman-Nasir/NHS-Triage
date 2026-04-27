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
    <div className="rounded-3xl border border-primary/10 bg-card/95 p-5 shadow-card-md shadow-primary/[0.08] ring-1 ring-border/60 backdrop-blur-sm sm:p-7">
      <h2 className="text-balance text-lg font-bold leading-snug text-foreground sm:text-xl">{question.text}</h2>

      <div className="mt-6">
        {question.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onBooleanAnswer(opt === 'Yes')}
                className={`rounded-2xl border-2 py-4 text-base font-bold transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-5 ${
                  answers[question.id] === (opt === 'Yes')
                    ? opt === 'Yes'
                      ? 'border-primary bg-primary/12 text-primary shadow-md shadow-primary/10'
                      : 'border-muted-foreground/35 bg-muted text-foreground shadow-inner'
                    : 'border-border text-muted-foreground hover:border-primary/35 hover:bg-muted/40'
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
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-card-foreground hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/25 text-muted-foreground'
                    }`}
                  >
                    {selected ? '✓' : ''}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground/40'}`} strokeWidth={2} aria-hidden />
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
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:py-4 ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-card-foreground hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-xs ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/25 text-muted-foreground'
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
            className="w-full resize-none rounded-2xl border border-input bg-background/80 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      )}

      {question.type !== 'boolean' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/92 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Next
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          {!question.required && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Optional — you can tap Next without selecting if you prefer.</p>
          )}
        </div>
      )}
    </div>
  );
}
