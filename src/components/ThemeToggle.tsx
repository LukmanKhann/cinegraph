"use client";

import { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ThemeModeContext } from "@/lib/theme";

export default function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeModeContext);

  return (
    <Tooltip title={dark ? "Switch to light theme" : "Switch to dark theme"}>
      <IconButton
        onClick={toggle}
        aria-label="Toggle light and dark theme"
        sx={{
          border: "2px solid var(--cg-ink)",
          borderRadius: 0,
          bgcolor: "var(--cg-paper)",
          color: "var(--cg-ink)",
          boxShadow: "3px 3px 0 var(--cg-shadow)",
          width: 38,
          height: 38,
          "&:hover": {
            bgcolor: "var(--cg-light)",
            transform: "translate(1px, 1px)",
            boxShadow: "2px 2px 0 var(--cg-shadow)",
          },
          "&:active": {
            transform: "translate(3px, 3px)",
            boxShadow: "1px 1px 0 var(--cg-shadow)",
          },
        }}
      >
        {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}