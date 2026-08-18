"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTheme, ThemeModeContext } from "@/lib/theme";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("cg-theme");
    // Read theme once on mount; initial render is light to avoid hydration
    // mismatch, then apply the stored/system preference before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(
      stored
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("cg-theme", dark ? "dark" : "light");
  }, [dark]);

  const theme = useMemo(() => buildTheme(dark ? "dark" : "light"), [dark]);

  return (
    <ThemeModeContext.Provider value={{ dark, toggle: () => setDark((current) => !current) }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}