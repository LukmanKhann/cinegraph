"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ConnectExplorer from "@/components/ConnectExplorer";

function ConnectInner() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  return <ConnectExplorer key={from ?? ""} initialFrom={from} />;
}

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectInner />
    </Suspense>
  );
}