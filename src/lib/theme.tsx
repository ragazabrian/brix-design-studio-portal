import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark";

const STORAGE_KEY = "brix-portal-theme";

type ThemeContextValue = {
  theme: ThemeChoice;
  setTheme: (next: ThemeChoice) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("light");

  // Read the saved choice after hydration so the server and client markup match.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const next: ThemeChoice = saved === "dark" || saved === "light" ? saved : system;
    setThemeState(next);
    applyTheme(next);
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
