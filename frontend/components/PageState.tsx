interface PageStateProps {
  title: string;
  message?: string;
}

export function PageLoadingState({ title, message }: PageStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden />
        <p className="text-foreground text-sm font-semibold">{title}</p>
        {message ? <p className="text-muted-foreground text-xs mt-1">{message}</p> : null}
      </div>
    </div>
  );
}

export function PageMessageState({ title, message }: PageStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card max-w-md">
        <p className="text-foreground font-semibold mb-2">{title}</p>
        {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      </div>
    </div>
  );
}
