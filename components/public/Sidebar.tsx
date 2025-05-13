'use client'

import { useState, useEffect } from "react";
import { WidgetType } from '@/lib/widget-client';
// Ya no usamos estas imports
// import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import WidgetRenderer from './WidgetRenderer';

// Widget interface
interface Widget {
  id: string;
  title: string;
  type: WidgetType;
  content: string | null;
  config: any;
  order: number;
  isActive: boolean;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sidebar configuration interface
interface SidebarConfig {
  showWidgets?: boolean;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  visible?: boolean;
  customHtml?: string;
  widgets?: any[];
}

export interface SidebarProps {
  widgets?: Widget[];
  config?: any; // Config from GlobalConfig
  position?: 'left' | 'right';
  className?: string;
  globalConfig?: any; // Global config for theme assignments
  pathname?: string; // Current path
}

export default function Sidebar({
  widgets = [],
  config,
  position = 'right',
  className = '',
  globalConfig,
  pathname = '/'
}: SidebarProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // El CSS del tema ya se inyecta desde layout.tsx
  // No necesitamos generar ni inyectar CSS aquí

  let sidebarConfig: SidebarConfig = {
    showWidgets: true,
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    width: 'w-64',
    visible: true,
    customHtml: ''
  };

  try {
    if (config) {
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      sidebarConfig = {
        ...sidebarConfig,
        ...configData,
      };
    }
  } catch (error) {
    console.error('Error parsing sidebar config:', error);
  }

  const customHtml = sidebarConfig.customHtml || '';
  const positionClasses = position === 'left' ? 'order-first' : 'order-last';

  if (sidebarConfig.visible === false) {
    return null;
  }

  const configWidgets = (sidebarConfig.widgets || []).map((widget, index) => ({
    ...widget,
    id: widget.id || `sidebar-widget-${index}`
  }));

  const allWidgets = [
    ...widgets.map((widget, index) => ({
      ...widget,
      id: widget.id || `sidebar-extern-${index}`
    })),
    ...configWidgets
  ];

  return (
    <>
      {/* El CSS del tema ya se inyecta desde layout.tsx */}

      <style>{`
        .sidebar-component {
          min-width: 0;
          overflow-x: auto;
          padding: var(--sidebar-padding-base, 1rem);
          box-sizing: border-box;
          flex-shrink: 0;
        }
      `}</style>
      {(() => {
        let widthClass = "";
        let widthStyle: React.CSSProperties = {};
        if (typeof sidebarConfig.width === "string") {
          if (/^\d+(px|rem|em|vw|%)$/.test(sidebarConfig.width.trim())) {
            widthStyle.width = sidebarConfig.width.trim();
          } else if (sidebarConfig.width.startsWith("w-")) {
            widthClass = sidebarConfig.width;
          }
        }
        return (
          <aside
            className={`sidebar-component ${positionClasses} ${widthClass} ${className}`}
            data-position={position}
            data-visible="true"
            style={{
              backgroundColor: 'var(--background-value, #f5f5f5)',
              color: 'var(--typography-paragraph-color, inherit)',
              ...widthStyle,
              border: 'none',
              height: '100%',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {sidebarConfig.showWidgets && allWidgets.length > 0 && (
              <div className="space-y-6">
                <style>{`
                  .widget-card {
                    background: var(--sidebar-cards-background, #fff);
                    border-radius: var(--sidebar-cards-borderRadius, 12px);
                    box-shadow: var(--sidebar-cards-boxShadow, none);
                    border: var(--sidebar-cards-borderWidth, 1px) solid var(--sidebar-cards-borderColor, #e5e7eb);
                    color: var(--sidebar-cards-color, inherit);
                    padding: var(--sidebar-cards-padding, 1rem);
                    margin: var(--sidebar-cards-margin, 0 0 1.5rem 0);
                    box-sizing: border-box;
                  }
                  .widget-card > * {
                    background: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                  }
                  .widget-card > [data-slot="card"] {
                    background: transparent !important;
                  }
                `}</style>
                {allWidgets.map((widget: Widget, index: number) => {
                  let widgetStyle: React.CSSProperties = {};
                  if (widget.config?.background) {
                    const bgType = widget.config.background?.type ||
                      (widget.config.background?.url ? "image" :
                        (widget.config.background?.value?.includes("gradient") ? "gradient" : "color"));
                    const bgValue = widget.config.background?.value || "";
                    const bgUrl = widget.config.background?.url || null;
                    if (bgType === "image" || bgUrl) {
                      const imageUrl = bgUrl ||
                        `/images/backgrounds/widget-${widget.id}.webp` ||
                        `/images/backgrounds/widget-${widget.id}.jpg` ||
                        `/images/backgrounds/widget-${widget.id}.png` ||
                        `/images/backgrounds/widget-${widget.id}.img`;
                      widgetStyle = {
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      };
                    } else if (bgType === "gradient" || bgType === "color") {
                      widgetStyle = {
                        background: bgValue
                      };
                    }
                  } else {
                    // Widget no tiene estilo custom, usar variables CSS
                    widgetStyle = {
                      background: 'var(--sidebar-cards-background, #f5f5f5)'
                    };
                  }

                  return (
                    <div
                      key={widget.id || `widget-${index}`}
                      className="widget-card"
                      style={widgetStyle}
                    >
                      <WidgetRenderer widget={widget} />
                    </div>
                  );
                })}
              </div>
            )}

            {customHtml && (
              <div
                className="content-html"
                style={{
                  fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                  fontSize: 'var(--typography-paragraph-fontSize, inherit)'
                }}
                dangerouslySetInnerHTML={{ __html: customHtml }}
              />
            )}
          </aside>
        );
      })()}
    </>
  );
}
