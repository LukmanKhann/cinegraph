import HealthPill from "@/components/HealthPill";

export default function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-[#0B0B0B] bg-[#FFE600]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-xs font-semibold text-[#0B0B0B] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-xl">
          Built on <strong>CognoDB</strong> — a managed graph database speaking
          openCypher over Bolt. Every query on this page is a graph traversal:
          multi-hop paths, shortest connections, shared cast.
        </p>
        <div className="flex items-center gap-3">
          <HealthPill />
          <span className="border-2 border-[#0B0B0B] bg-[#FFFFFF] px-2 py-0.5 shadow-[2px_2px_0_#0B0B0B]">
            CineGraph
          </span>
        </div>
      </div>
    </footer>
  );
}