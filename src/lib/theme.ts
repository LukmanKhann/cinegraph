"use client";

import { createTheme } from "@mui/material/styles";
import { createContext } from "react";

export interface ThemeMode {
  dark: boolean;
  toggle: () => void;
}

export const ThemeModeContext = createContext<ThemeMode>({
  dark: false,
  toggle: () => {},
});

/** Coffee/maroon neo-brutal palette — surfaces and borders are driven by
 *  CSS variables (so the .dark class on <html> recolors Tailwind styles),
 *  while the MUI palette uses real hex values per mode (MUI needs to parse
 *  colors for hover/contrast math). */

/** Coffee/maroon neo-brutal palette — driven by CSS variables so the
 *  light/dark toggle in the nav recolors MUI components too. */
export const movieGradients: Record<string, [string, string]> = {
  mocha: ["#C8A87C", "#6B4A2F"],
  maroon: ["#7B2D26", "#3B2A1A"],
  latte: ["#F3E9D7", "#C8A87C"],
  espresso: ["#3B2A1A", "#17120C"],
  cocoa: ["#8A6A45", "#7B2D26"],
  caramel: ["#C8A87C", "#7B2D26"],
};

const border = `2px solid var(--cg-ink)`;
const hardShadow = `4px 4px 0 var(--cg-shadow)`;
const hardShadowSmall = `3px 3px 0 var(--cg-shadow)`;

export function buildTheme(mode: "light" | "dark") {
  const dark = mode === "dark";
  const paper = dark ? "#2b2118" : "#fbf6ec";
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#8a6a45" : "#6b4a2f", contrastText: paper },
      secondary: { main: dark ? "#a04134" : "#7b2d26", contrastText: paper },
      success: { main: dark ? "#4a3520" : "#3b2a1a", contrastText: paper },
      error: { main: dark ? "#a04134" : "#7b2d26", contrastText: paper },
      warning: { main: "#c8a87c", contrastText: dark ? "#fbf6ec" : "#17120c" },
      background: {
        default: dark ? "#1e1610" : "#f3e9d7",
        paper: dark ? "#2b2118" : "#fbf6ec",
      },
      text: {
        primary: dark ? "#d9c3a0" : "#17120c",
        secondary: dark ? "#8a8578" : "#6b5b45",
      },
    },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily:
      "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 900, letterSpacing: "-0.03em" },
    h2: { fontWeight: 900, letterSpacing: "-0.02em" },
    h3: { fontWeight: 900, letterSpacing: "-0.02em" },
    h4: { fontWeight: 900, letterSpacing: "-0.01em" },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { fontWeight: 800, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--cg-bg)",
          color: "var(--cg-ink)",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--cg-ink) 14%, transparent) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          border,
          borderRadius: 0,
          boxShadow: hardShadow,
          fontWeight: 800,
          textTransform: "none",
          transition: "transform 120ms ease, box-shadow 120ms ease",
          padding: "10px 18px",
          "&:hover": {
            transform: "translate(1px, 1px)",
            boxShadow: hardShadowSmall,
          },
          "&:active": {
            transform: "translate(3px, 3px)",
            boxShadow: "1px 1px 0 var(--cg-shadow)",
          },
          "&.Mui-disabled": {
            borderColor: "var(--cg-ink)",
            boxShadow: hardShadow,
            opacity: 0.4,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border,
          boxShadow: hardShadow,
          transition: "transform 120ms ease, box-shadow 120ms ease",
          "&:hover": {
            transform: "translate(2px, 2px)",
            boxShadow: hardShadowSmall,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 0 },
        outlined: { border },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "1.5px solid var(--cg-ink)",
          fontWeight: 700,
          "&:hover": { boxShadow: hardShadowSmall },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            backgroundColor: "var(--cg-paper)",
            "& fieldset": { border: `2px solid var(--cg-ink)` },
            "&:hover fieldset": { borderWidth: 2 },
            "&.Mui-focused fieldset": {
              border: `2px solid var(--cg-ink)`,
              boxShadow: hardShadow,
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border,
          boxShadow: hardShadow,
          marginTop: "6px",
          backgroundColor: "var(--cg-paper)",
        },
        option: {
          "&[aria-selected='true']": { backgroundColor: "var(--cg-light)" },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid var(--cg-ink) !important`,
          fontWeight: 800,
          backgroundColor: "var(--cg-paper)",
          color: "var(--cg-ink)",
          "&.Mui-selected": {
            backgroundColor: "var(--cg-primary)",
            color: "var(--cg-paper)",
            boxShadow: hardShadowSmall,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border,
          boxShadow: hardShadowSmall,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: "var(--cg-skeleton)",
        },
      },
    },
  },
  });
}