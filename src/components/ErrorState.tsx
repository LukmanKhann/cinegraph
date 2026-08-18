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
    <div className="flex flex-col items-center gap-3 border-2 border-[#0B0B0B] bg-[#FFE3E9] px-6 py-12 text-center shadow-[4px_4px_0_#0B0B0B]">
      <span className="grid h-14 w-14 place-items-center border-2 border-[#0B0B0B] bg-[#FF4D6D] text-2xl shadow-[3px_3px_0_#0B0B0B]">
        📡
      </span>
      <p className="max-w-md text-sm font-extrabold uppercase tracking-wide">
        {message}
      </p>
      <p className="max-w-md text-xs font-semibold text-[#6B6B6B]">
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