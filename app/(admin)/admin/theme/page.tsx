"use client";
import React, { useEffect, useState } from "react";
import PresetList from '@/components/admin/theme/PresetList';
import { Card, CardContent } from "@/components/ui/card";
import { getAdminThemePresetConfigById } from "@/lib/admin-themeUtils";

export default function ThemeAdminPage() {
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/global");
        const json = await res.json();
        const id = json?.adminPanelThemePresetId;
        let style: React.CSSProperties = {};
        if (id) {
          const tc = await getAdminThemePresetConfigById(id);
          if (tc && tc.cards && tc.cards.background && tc.cards.background.type === "image") {
            // Imagen: SOLO props image
            style = {
              backgroundImage: `url(/images/backgrounds/card-${id}.img)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              color: "var(--card-foreground, #333)",
              boxShadow: "var(--shadow, 0 1px 3px rgba(0,0,0,.08))"
            };
          } else if (tc && tc.cards && tc.cards.background && tc.cards.background.value) {
            // Gradient/color: solo property background
            style = {
              background: tc.cards.background.value,
              color: "var(--card-foreground, #333)",
              boxShadow: "var(--shadow, 0 1px 3px rgba(0,0,0,.08))"
            };
          } else {
            style = {
              background: "var(--card, #fff)",
              color: "var(--card-foreground, #333)",
              boxShadow: "var(--shadow, 0 1px 3px rgba(0,0,0,.08))"
            };
          }
          if (tc && tc.cards && tc.cards.margin)
            style.margin = tc.cards.margin;
          else
            style.margin = "var(--spacing-margin, 2rem auto)";
          style.maxWidth = "900px";
        } else {
          style = {
            background: "var(--card, #fff)",
            margin: "var(--spacing-margin, 2rem auto)",
            maxWidth: "900px",
            color: "var(--card-foreground, #333)",
            boxShadow: "var(--shadow, 0 1px 3px rgba(0,0,0,.08))"
          };
        }
        style.width = "100%";
        setCardStyle(style);
      } catch {
        setCardStyle({
          background: "var(--card, #fff)",
          margin: "var(--spacing-margin, 2rem auto)",
          maxWidth: "900px",
          width: "100%",
          color: "var(--card-foreground, #333)",
          boxShadow: "var(--shadow, 0 1px 3px rgba(0,0,0,.08))"
        });
      }
    })();
  }, []);
  return (
    <div
      style={{
        margin: "var(--spacing-margin, 2rem auto)",
        maxWidth: "900px",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <Card style={cardStyle}>
        <CardContent
          style={{
            padding: "var(--spacing-padding, 2rem 1rem)"
          }}
        >
          <PresetList />
        </CardContent>
      </Card>
    </div>
  );
}
