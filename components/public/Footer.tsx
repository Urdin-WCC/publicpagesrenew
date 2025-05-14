'use client'

import { useState, useEffect } from "react";
import { WidgetType } from '@/lib/widget-client';
import WidgetRenderer from './WidgetRenderer';
import dynamic from 'next/dynamic';
import FooterHtmlContent from './FooterHtmlContent';

interface FooterWidget {
  id?: string;
  title: string;
  type: WidgetType | string;
  content?: string | null;
  config?: any;
  order?: number;
  isActive?: boolean;
}

interface FooterConfig {
  widgets?: FooterWidget[];
  columns?: number;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  secondaryHtml?: string;
  visible?: boolean;
}

export interface FooterProps {
  config?: any;
  stickyClass?: string;
  globalConfig?: any;
  pathname?: string;
}

export default function Footer({
  config,
  stickyClass = '',
  globalConfig,
  pathname = '/'
}: FooterProps) {
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

  // El CSS ya se inyecta en el layout principal:
  // El tema lo maneja layout.tsx utilizando getThemeConfigsForComponent('footer')
  // NO generar un theme CSS aquí para evitar conflictos con el sistema global
  const footerThemeCSS = ""; 

  let footerConfig: FooterConfig = {
    columns: 3,
    backgroundColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    height: 'auto',
    secondaryHtml: '',
    widgets: [],
    visible: true
  };

  try {
    if (config) {
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      footerConfig = {
        ...footerConfig,
        ...configData,
      };
    }
  } catch (error) {
    console.error('Error parsing footer config:', error);
  }

  if (footerConfig.visible === false) {
    return null;
  }

  const secondaryHtml = footerConfig.secondaryHtml || '';
  // Utilizamos CSS personalizado para el grid en lugar de clases tailwind
  const columnsValue = Math.min(Math.max(1, footerConfig.columns || 3), 12);
  // La clase grid-cols-1 siempre se aplica para móviles, pero usamos CSS personalizado para md+
  const columnClasses = `grid-cols-1`;
  const configWidgets = (footerConfig.widgets || []).map((widget, index) => ({
    ...widget,
    id: widget.id || `footer-widget-${index}`
  }));

  // Obtener tema del componente utilizando los ids globales guardados en asignaciones themeAssignments
  // El tema ya lo obtuvo layout.tsx y lo inyectó en el CSS
  // Los estilos están accesibles como variables CSS

  return (
    <>
      {/* No inyectar estilos aquí, el layout lo hace */}
      <style>{`
        .footer-component {
          min-width: 0;
          overflow: hidden; /* Cambiado de overflow-x: auto para evitar barras de desplazamiento */
          padding-top: var(--footer-padding-top, var(--footer-padding-base, 1rem));
          padding-bottom: var(--footer-padding-bottom, var(--footer-padding-base, 1rem));
          padding-left: var(--footer-padding-left, var(--footer-padding-base, 1rem));
          padding-right: var(--footer-padding-right, var(--footer-padding-base, 1rem));
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      <footer
        className={`footer-component mt-auto ${stickyClass}`}
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          color: 'var(--typography-paragraph-color, inherit)',
          height: footerConfig.height !== 'auto' ? footerConfig.height : 'auto',
          border: 'none'
        }}
      >
        <div className="w-full" style={{ maxWidth: "100%", height: "100%", overflow: "hidden" }}>
          {configWidgets.length > 0 && (
            <div className={`grid ${columnClasses} w-full`} style={{ gap: "var(--footer-cards-gap, 20px)" }}>
              <style>{`
                .footer-component .grid, .footer-component .mb-6 {
                  min-height: unset !important;
                  height: auto !important;
                  max-width: 100%;
                  overflow: hidden; /* Evita barras de desplazamiento en el grid */
                  display: grid;
                  align-items: stretch; /* Estira los widgets para que compartan la misma altura */
                  grid-auto-rows: 1fr; /* Hace que todas las filas tengan la misma altura */
                  gap: var(--footer-cards-gap, 20px);
                }
                
                /* Override de columnas del grid para tamaño mediano y superior */
                @media (min-width: 768px) {
                  .footer-component .grid {
                    grid-template-columns: repeat(${columnsValue}, 1fr) !important;
                  }
                }
                
                .footer-component .widget-card {
                  background: var(--footer-cards-background, transparent);
                  border-radius: var(--footer-cards-borderRadius, 12px);
                  box-shadow: var(--footer-cards-boxShadow, 0 2px 4px rgba(0,0,0,0.1));
                  /* El tema puede poner múltiples sombras separadas por coma, por ejemplo:
                   --footer-cards-boxShadow: 0 2px 4px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05); */
                  border: var(--footer-cards-borderWidth, 1px) solid var(--footer-cards-borderColor, #e5e7eb);
                  color: var(--footer-cards-color, inherit);
                  padding-top: var(--footer-cards-padding-top, var(--footer-cards-padding, 1rem));
                  padding-bottom: var(--footer-cards-padding-bottom, var(--footer-cards-padding, 1rem));
                  padding-left: var(--footer-cards-padding-left, var(--footer-cards-padding, 1rem));
                  padding-right: var(--footer-cards-padding-right, var(--footer-cards-padding, 1rem));
                  margin-top: var(--footer-cards-margin-top, var(--footer-cards-margin, 0 0 1rem 0));
                  margin-bottom: var(--footer-cards-margin-bottom, var(--footer-cards-margin, 0 0 1rem 0));
                  margin-left: var(--footer-cards-margin-left, var(--footer-cards-margin, 0 0 1rem 0));
                  margin-right: var(--footer-cards-margin-right, var(--footer-cards-margin, 0 0 1rem 0));
                  font-family: var(--footer-cards-fontFamily, inherit);
                  font-size: var(--footer-cards-fontSize, inherit);
                  font-weight: var(--footer-cards-fontWeight, inherit);
                  width: 100%; /* Asegura que el widget ocupe todo el espacio de la columna */
                  height: 100%; /* Asegura que el widget ocupe todo el espacio de la fila */
                  display: flex;
                  flex-direction: column;
                  overflow: hidden; /* Evita que el contenido cause desbordamiento */
                }
                .widget-card > * {
                  background: transparent !important;
                  box-shadow: none !important;
                  border: none !important;
                  max-width: 100%;
                  overflow: hidden; /* Asegura que el contenido del widget no desborde */
                }
              `}</style>
              {configWidgets.map((widget, index: number) => {
                let widgetStyle: React.CSSProperties = {};
                if (widget.config?.background) {
                  if (widget.config.background.type === "image") {
                    widgetStyle = {
                      backgroundImage: `url(/images/backgrounds/widget-${widget.id}.img)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    };
                  } else if (widget.config.background.value) {
                    widgetStyle = {
                      background: widget.config.background.value
                    };
                  }
                } else {
                  // Widget no tiene estilo custom, usar default theme
                  widgetStyle = {
                    background: 'var(--footer-cards-background, #f5f5f5)'
                  };
                }

                // Construcción de styles para margin y padding explícitos desde variables CSS
                const marginStyles: React.CSSProperties = {
                  marginTop: "var(--footer-cards-margin-top, var(--footer-cards-margin, 0 0 1rem 0))",
                  marginBottom: "var(--footer-cards-margin-bottom, var(--footer-cards-margin, 0 0 1rem 0))",
                  marginLeft: "var(--footer-cards-margin-left, var(--footer-cards-margin, 0 0 1rem 0))",
                  marginRight: "var(--footer-cards-margin-right, var(--footer-cards-margin, 0 0 1rem 0))",
                  paddingTop: "var(--footer-cards-padding-top, var(--footer-cards-padding, 1rem))",
                  paddingBottom: "var(--footer-cards-padding-bottom, var(--footer-cards-padding, 1rem))",
                  paddingLeft: "var(--footer-cards-padding-left, var(--footer-cards-padding, 1rem))",
                  paddingRight: "var(--footer-cards-padding-right, var(--footer-cards-padding, 1rem))"
                };
                return (
                  <div key={widget.id || `widget-${index}`} className="widget-card" style={{ ...widgetStyle, ...marginStyles }}>
                    <WidgetRenderer
                      widget={widget as any}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {secondaryHtml && (
            <div
              className="content-html"
              style={{
                fontFamily: 'var(--typography-paragraph-fontFamily, inherit)',
                fontSize: 'var(--typography-paragraph-fontSize, inherit)',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              <FooterHtmlContent content={secondaryHtml} />
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
