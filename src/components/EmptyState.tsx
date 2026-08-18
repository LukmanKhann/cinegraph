export default function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 border-2 border-dashed border-[#0B0B0B] bg-[#FFFFFF]/60 px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center border-2 border-[#0B0B0B] bg-[#FFE600] text-2xl shadow-[3px_3px_0_#0B0B0B]">
        🎬
      </span>
      <p className="text-sm font-extrabold uppercase tracking-wide">{title}</p>
      {hint && <p className="max-w-sm text-xs font-semibold text-[#6B6B6B]">{hint}</p>}
    </div>
  );
}