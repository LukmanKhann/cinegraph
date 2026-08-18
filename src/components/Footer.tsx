import HealthPill from "@/components/HealthPill";

export default function Footer() {
  return (
    <footer className="border-t border-edge/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Built on <span className="text-foreground">CognoDB</span> — a managed
          graph database speaking openCypher over Bolt. Every query on this page
          is a graph traversal: multi-hop paths, shortest connections, shared
          cast.
        </p>
        <div className="flex items-center gap-3">
          <HealthPill />
          <span>CineGraph</span>
        </div>
      </div>
    </footer>
  );
}