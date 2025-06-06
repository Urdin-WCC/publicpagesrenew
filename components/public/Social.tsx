"use client";

import React from "react";

interface SocialIcon {
  name: string;
  url: string;
  svgLight: string;
  svgDark: string;
  openInNewTab?: boolean;
}

interface SocialConfig {
  textBefore?: string;
  iconSize?: string;
  icons: SocialIcon[];
}

interface SocialProps {
  config: SocialConfig;
  theme?: "auto" | "light" | "dark";
  inline?: boolean;
}

function useSystemTheme(): "light" | "dark" {
  const [theme, setTheme] = React.useState<"light"|"dark">("light");
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mql.matches ? "dark" : "light");
    const listener = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);
  return theme;
}

export default function Social({ config, theme="auto", inline=false }: SocialProps) {
  const systemTheme = typeof window !== "undefined" ? useSystemTheme() : "light";
  const effectiveTheme: "light"|"dark" = theme !== "auto" ? theme as "light"|"dark" : systemTheme;
  const size = config.iconSize || "20px";

  if (!config || !Array.isArray(config.icons) || config.icons.length === 0) return null;
  
  return (
    <div className={`social-public ${inline ? "flex flex-row gap-4 items-center" : "flex flex-col gap-3"}`}>
      {config.textBefore && (
        <div className="mb-1 text-base font-medium">{config.textBefore}</div>
      )}
      <div className={`flex ${inline ? "flex-row gap-2 items-center" : "flex-row flex-wrap gap-4"}`}>
        {config.icons.map((icon, idx) => {
          const svgUrl = effectiveTheme === "dark" ? icon.svgDark : icon.svgLight;
          const isExternal = svgUrl && (svgUrl.startsWith("http://") || svgUrl.startsWith("https://"));
          const openNewTab = icon.openInNewTab ?? true;
          return (
            <a
              key={icon.name + idx}
              href={icon.url}
              title={icon.name}
              style={{ display: "inline-block", width: size, height: size }}
              className="social-link hover:scale-110 transition"
              {...(openNewTab
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {svgUrl ? (
                isExternal ? (
                  <img src={svgUrl} alt={icon.name} style={{ width: size, height: size }} />
                ) : (
                  <img src={`/icons/${svgUrl}`} alt={icon.name} style={{ width: size, height: size }} />
                )
              ) : (
                <span className="inline-block font-bold" style={{ fontSize: size }}>
                  {icon.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
