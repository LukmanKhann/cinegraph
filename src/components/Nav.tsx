import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#0B0B0B] bg-[#FFF8E7]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center border-2 border-[#0B0B0B] bg-[#FFE600] text-sm font-black shadow-[2px_2px_0_#0B0B0B]">
            CG
          </span>
          <span className="text-lg font-black tracking-tight">
            Cine<span className="underline decoration-[#FF4D6D] decoration-4">Graph</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="border-2 border-[#0B0B0B] bg-[#FFFFFF] px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_#0B0B0B] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#0B0B0B]"
          >
            Browse
          </Link>
          <Link
            href="/connect"
            className="border-2 border-[#0B0B0B] bg-[#4D7CFE] px-3 py-1.5 text-sm font-bold text-white shadow-[3px_3px_0_#0B0B0B] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#0B0B0B]"
          >
            Connections →
          </Link>
        </nav>
      </div>
    </header>
  );
}