"use client";

import Button from "@mui/material/Button";

export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border-2 border-[var(--cg-ink)] bg-[var(--cg-error-bg)] px-6 py-12 text-center shadow-[4px_4px_0_var(--cg-shadow)]">
      <span className="grid h-14 w-14 place-items-center border-2 border-[var(--cg-ink)] bg-[var(--cg-secondary)] text-2xl shadow-[3px_3px_0_var(--cg-shadow)]">
        📡
      </span>
      <p className="max-w-md text-sm font-extrabold uppercase tracking-wide">
        {message}
      </p>
      <p className="max-w-md text-xs font-semibold text-[var(--cg-muted)]">
        This happens when the graph database is unreachable — not your
        connection. Try again in a moment.
      </p>
      {onRetry && (
        <Button variant="contained" color="primary" onClick={onRetry} sx={{ mt: 1 }}>
          Try again
        </Button>
      )}
    </div>
  );
}