import Link from "next/link";

export default function PersonCard({
  id,
  name,
  sub,
}: {
  id: string;
  name: string;
  sub?: string | null;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <Link
      href={`/person/${id}`}
      className="group flex items-center gap-3 border-2 border-[#0B0B0B] bg-[#FFFFFF] p-3 shadow-[3px_3px_0_#0B0B0B] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0B0B0B]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#0B0B0B] bg-[#FFE600] text-xs font-black shadow-[2px_2px_0_#0B0B0B]">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-extrabold group-hover:underline group-hover:decoration-[#FF4D6D] group-hover:decoration-2">
          {name}
        </span>
        {sub && (
          <span className="block text-xs font-semibold text-[#6B6B6B]">{sub}</span>
        )}
      </span>
    </Link>
  );
}