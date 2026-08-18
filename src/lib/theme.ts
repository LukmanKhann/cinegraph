"use client";

import { createTheme } from "@mui/material/styles";

export const neoColors = {
  cream: "#FFF8E7",
  paper: "#FFFFFF",
  black: "#0B0B0B",
  yellow: "#FFE600",
  blue: "#4D7CFE",
  pink: "#FF4D6D",
  green: "#3DDC97",
  orange: "#FF9F1C",
  purple: "#B983FF",
  muted: "#6B6B6B",
  border: "#0B0B0B",
};

export const movieGradients: Record<string, [string, string]> = {
  yellow: ["#FFE600", "#FFB800"],
  blue: ["#4D7CFE", "#7B2CBF"],
  pink: ["#FF4D6D", "#FF9F1C"],
  green: ["#3DDC97", "#0FA958"],
  purple: ["#B983FF", "#4D7CFE"],
  orange: ["#FF9F1C", "#FF4D6D"],
};

const border = `2px solid ${neoColors.border}`;
const hardShadow = `4px 4px 0 ${neoColors.border}`;
const hardShadowSmall = `3px 3px 0 ${neoColors.border}`;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: neoColors.yellow, contrastText: neoColors.black },
    secondary: { main: neoColors.blue, contrastText: "#FFFFFF" },
    success: { main: neoColors.green, contrastText: neoColors.black },
    error: { main: neoColors.pink, contrastText: "#FFFFFF" },
    warning: { main: neoColors.orange, contrastText: neoColors.black },
    background: { default: neoColors.cream, paper: neoColors.paper },
    text: { primary: neoColors.black, secondary: neoColors.muted },
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
          backgroundColor: neoColors.cream,
          color: neoColors.black,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(11,11,11,0.12) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          border: `2px solid ${neoColors.black}`,
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
            boxShadow: "1px 1px 0 #0B0B0B",
          },
          "&.Mui-disabled": {
            borderColor: neoColors.black,
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
          border: `1.5px solid ${neoColors.black}`,
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
            backgroundColor: neoColors.paper,
            "& fieldset": { border: `2px solid ${neoColors.black}` },
            "&:hover fieldset": { borderWidth: 2 },
            "&.Mui-focused fieldset": {
              border: `2px solid ${neoColors.black}`,
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
          border: `2px solid ${neoColors.black}`,
          boxShadow: hardShadow,
          marginTop: "6px",
        },
        option: {
          "&[aria-selected='true']": { backgroundColor: neoColors.yellow },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `2px solid ${neoColors.black} !important`,
          fontWeight: 800,
          "&.Mui-selected": {
            backgroundColor: neoColors.yellow,
            color: neoColors.black,
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
          backgroundColor: "#EDE6D3",
        },
      },
    },
  },
});