"use client";

export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-edge bg-surface/50 px-6 py-12 text-center">
      <span className="text-2xl">📡</span>
      <p className="max-w-md text-sm font-semibold">{message}</p>
      <p className="max-w-md text-xs text-muted">
        This happens when the graph database is unreachable — not your
        connection. Try again in a moment.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-accent-strong"
        >
          Try again
        </button>
      )}
    </div>
  );
}