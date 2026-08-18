import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function SkeletonCard() {
  return (
    <Box className="overflow-hidden border-2 border-[#0B0B0B] bg-[#FFFFFF] shadow-[4px_4px_0_#0B0B0B]">
      <Skeleton variant="rectangular" height={112} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="75%" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" width="50%" sx={{ fontSize: "0.8rem" }} />
      </Box>
    </Box>
  );
}

export function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function Spinner({ label = "Walking the graph…" }: { label?: string }) {
  return (
    <Box className="inline-flex items-center gap-2.5 text-sm font-bold">
      <Skeleton
        variant="circular"
        width={22}
        height={22}
        sx={{
          border: "2px solid #0B0B0B",
          bgcolor: "#FFE600",
          animation: "skeleton-pulse 1.2s ease-in-out infinite",
          "@keyframes skeleton-pulse": {
            "0%,100%": { transform: "scale(1)" },
            "50%": { transform: "scale(0.7)" },
          },
        }}
      />
      <span className="uppercase tracking-wide text-[#6B6B6B]">{label}</span>
    </Box>
  );
}