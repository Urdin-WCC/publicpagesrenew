'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import HeaderHtmlContent from './HeaderHtmlContent';
import Social from './Social';
import { translations } from '@/app/translations';
import { fetchNavigationMenu } from '@/actions/menu-actions';
// Ya no necesitamos estas importaciones - el tema se gestiona en layout.tsx
// import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';
import { fetchSocialConfig } from '@/actions/social-actions';

// Types
interface NavMenuItem {
  id?: string;
  label: string;
  target?: string;
  url?: string;
  customUrl?: string;
  openInNewTab?: boolean;
}

interface HeaderElementConfig {
  type: string;
  visible: boolean;
  position: string;
  logoUrl?: string;
  html?: string;
  height?: string;
}

interface SocialLink {
  platform: string;
  name?: string;
  url: string;
  icon?: string;
  newTab?: boolean;
}

export interface HeaderProps {
  siteName?: string;
  logoUrl?: string | null;
  config?: any;
  stickyClass?: string;
  globalConfig?: any;
  pathname?: string;
}

export default function Header({
  siteName = translations.common.appName,
  logoUrl: globalLogoUrl,
  config,
  stickyClass = '',
  globalConfig,
  pathname = '/'
}: HeaderProps) {
  // THEMING: Modo claro/oscuro reactivo y configs
  const [isDark, setIsDark] = useState<boolean>(typeof window !== "undefined" ? document.documentElement.classList.contains("dark") : false);
  const [navItems, setNavItems] = useState<NavMenuItem[]>([]);
  const [socialConfig, setSocialConfig] = useState<any>(null);

  // Setup observer for dark mode switching
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // NO se obtienen configs de tema aquí - el layout ya hace eso
  // y generará el CSS para todos los componentes

  // Nav menu + social
  useEffect(() => {
    fetchNavigationMenu().then((result) => {
      const navigationItems: any[] = result?.items || [];
      const mapped: NavMenuItem[] = navigationItems
        .filter(item => item && item.label)
        .map((item) => {
          let url = '/';
          if (item.target === 'home') url = '/';
          else if (item.target === 'blog') url = '/blog';
          else if (item.target === 'portfolio') url = '/portfolio';
          else if (item.target === 'custom' && item.customUrl) url = item.customUrl;
          else if (item.target?.startsWith('/')) url = item.target;
          return { ...item, url };
        })
        .filter((item: NavMenuItem) => item.url);
      setNavItems(mapped);
    });
    fetchSocialConfig().then(setSocialConfig);
  }, []);

  // El CSS del tema ya se inyecta desde layout.tsx
  // No necesitamos generar ni inyectar CSS aquí

  // Configuración reactiva de elementos
  let headerElements: HeaderElementConfig[] = [
    { type: "logo", visible: true, position: "top-left" },
    { type: "text", visible: true, position: "top-center" },
    { type: "menu", visible: true, position: "top-right" },
    { type: "social", visible: true, position: "bottom-left" },
    { type: "theme", visible: true, position: "bottom-right" },
    { type: "html", visible: false, position: "center-center" }
  ];
  try {
    if (config) {
      const configData = typeof config === 'string' ? JSON.parse(config) : config;
      if (configData && configData.elements && Array.isArray(configData.elements)) {
        headerElements = configData.elements;
      }
    }
  } catch (error) {
    console.error('Error parsing header config:', error);
  }

  const positionMatrix = {
    'top-left': null as HeaderElementConfig | null,
    'top-center': null as HeaderElementConfig | null,
    'top-right': null as HeaderElementConfig | null,
    'center-left': null as HeaderElementConfig | null,
    'center-center': null as HeaderElementConfig | null,
    'center-right': null as HeaderElementConfig | null,
    'bottom-left': null as HeaderElementConfig | null,
    'bottom-center': null as HeaderElementConfig | null,
    'bottom-right': null as HeaderElementConfig | null
  };
  headerElements.forEach(element => {
    if (element.visible && element.position in positionMatrix) {
      positionMatrix[element.position as keyof typeof positionMatrix] = element;
    }
  });

  const logoElement = headerElements.find(elem => elem.type === 'logo' && elem.visible);
  const headerHeight = logoElement?.height || 'auto';

  // Render de cada elemento del header
  const renderHeaderElement = (element: HeaderElementConfig | null) => {
    if (!element) return null;

    switch (element.type) {
      case 'logo':
        return (
          <div className="header-element logo-element">
            <Link href="/" className="flex items-center">
              <div className="logo-container">
                <Image
                  src="/images/logo.img"
                  alt={siteName}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-auto h-auto"
                  style={{ objectFit: "contain", maxWidth: "none", maxHeight: "none" }}
                  unoptimized={true}
                  priority={true}
                />
              </div>
            </Link>
          </div>
        );
      case 'text':
        return (
          <div className="header-element text-element">
            <span
              className="text-lg font-semibold"
              style={{
                fontFamily: 'var(--typography-heading-fontFamily, inherit)',
                color: 'var(--typography-heading-color, inherit)',
                fontWeight: 'var(--typography-heading-fontWeight, 600)',
                fontSize: 'var(--typography-heading-fontSize, inherit)'
              }}
            >
              {siteName}
            </span>
          </div>
        );
      case 'menu':
        return (
          <div className="header-element menu-element">
            <nav className="hidden md:block">
              <ul className="flex space-x-4">
                {navItems.map((item: NavMenuItem, index: number) => (
                  <li key={item.id || `nav-${index}`}>
                    <Link
                      href={
                        !item.url ||
                        typeof item.url !== "string" ||
                        item.url === "" ||
                        item.url.includes("<") ||
                        item.url.includes(">")
                          ? "#"
                          : item.url
                      }
                      className="transition"
                      style={{
                        color: 'var(--typography-link-color, #333)',
                        fontFamily: 'var(--typography-link-fontFamily, inherit)',
                        fontSize: 'var(--typography-link-fontSize, inherit)'
                      }}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        );
      case 'social':
        return (
          <div className="header-element social-element">
            {socialConfig ? <Social config={socialConfig} inline /> : null}
          </div>
        );
      case 'theme':
        return (
          <div className="header-element theme-element">
            <div className="theme-switcher-placeholder"></div>
          </div>
        );
      case 'html': {
        if (!element.html) return null;
        return (
          <div className="header-element html-element">
            <HeaderHtmlContent content={element.html} />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      {/* El CSS del tema ya se inyecta desde layout.tsx, no necesitamos hacerlo aquí */}
      <style dangerouslySetInnerHTML={{ __html: `
        .header-position-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          pointer-events: none;
          z-index: 1;
          padding: 0;
          background: transparent;
        }

        /* Control de alineación por cuadrante */
        .header-position-layer.vertical-top { align-items: flex-start; }
        .header-position-layer.vertical-center { align-items: center; }
        .header-position-layer.vertical-bottom { align-items: flex-end; }

        .header-position-layer.horizontal-left { justify-content: flex-start; }
        .header-position-layer.horizontal-center { justify-content: center; }
        .header-position-layer.horizontal-right { justify-content: flex-end; }

        .logo-element img { max-height: 60px; }

        .header-component {
          background: var(--header-background, var(--background-value, white));
          background-image: var(--header-backgroundImage, none);
          background-size: var(--header-backgroundSize, cover);
          background-position: var(--header-backgroundPosition, center);
          border-radius: var(--header-borderRadius, 0);
          box-shadow: var(--header-boxShadow, none); /* scoped por ThemeStyleManager */
          border: var(--header-borderWidth, 0) solid var(--header-borderColor, transparent);
          color: var(--header-color, var(--typography-heading-color, inherit));
          padding: var(--header-padding-base, 4px);
          /* El margen global SE ELIMINA para evitar espacios o scroll indeseados. */
          transition: background 0.3s, color 0.3s;
        }

        .header-element {
          pointer-events: auto;
          max-width: 100%;
          box-sizing: border-box;
          /* Permitir personalización granular si el preset define más variables */
          padding-top: var(--header-padding-top, var(--header-padding-base, 4px));
          padding-bottom: var(--header-padding-bottom, var(--header-padding-base, 4px));
          padding-left: var(--header-padding-left, var(--header-padding-base, 4px));
          padding-right: var(--header-padding-right, var(--header-padding-base, 4px));
          margin-top: var(--header-margin-top, var(--header-elements-margin, 0 6px));
          margin-bottom: var(--header-margin-bottom, var(--header-elements-margin, 0 6px));
          margin-left: var(--header-margin-left, var(--header-elements-margin, 0 6px));
          margin-right: var(--header-margin-right, var(--header-elements-margin, 0 6px));
          box-shadow: var(--header-element-boxShadow, none); /* scoped por ThemeStyleManager */
        }

        .header-element {
          pointer-events: auto;
          max-width: 100%;
          box-sizing: border-box;
          /* Permitir personalización granular si el preset define más variables */
          padding-top: var(--header-padding-top, var(--header-padding-base, 4px));
          padding-bottom: var(--header-padding-bottom, var(--header-padding-base, 4px));
          padding-left: var(--header-padding-left, var(--header-padding-base, 4px));
          padding-right: var(--header-padding-right, var(--header-padding-base, 4px));
          margin-top: var(--header-margin-top, var(--header-elements-margin, 0 6px));
          margin-bottom: var(--header-margin-bottom, var(--header-elements-margin, 0 6px));
          margin-left: var(--header-margin-left, var(--header-elements-margin, 0 6px));
          margin-right: var(--header-margin-right, var(--header-elements-margin, 0 6px));
        }

        @media (max-width: 768px) { .header-position-layer { padding: 4px; } }
      `}} />

      <header
        className={`header-component w-full shadow-sm ${stickyClass}`}
        data-visible="true"
        style={{
          backgroundColor: 'var(--background-value, white)',
          height: headerHeight !== 'auto' ? headerHeight : undefined,
          position: 'relative'
        }}>
        <div className="w-full relative min-h-[100px]" style={{ maxWidth: "100%", height: "100%" }}>
          {/* Fila superior */}
          <div className="header-position-layer vertical-top horizontal-left">
            {renderHeaderElement(positionMatrix['top-left'])}
          </div>
          <div className="header-position-layer vertical-top horizontal-center">
            {renderHeaderElement(positionMatrix['top-center'])}
          </div>
          <div className="header-position-layer vertical-top horizontal-right">
            {renderHeaderElement(positionMatrix['top-right'])}
          </div>
          {/* Fila central */}
          <div className="header-position-layer vertical-center horizontal-left">
            {renderHeaderElement(positionMatrix['center-left'])}
          </div>
          <div className="header-position-layer vertical-center horizontal-center">
            {renderHeaderElement(positionMatrix['center-center'])}
          </div>
          <div className="header-position-layer vertical-center horizontal-right">
            {renderHeaderElement(positionMatrix['center-right'])}
          </div>
          {/* Fila inferior */}
          <div className="header-position-layer vertical-bottom horizontal-left">
            {renderHeaderElement(positionMatrix['bottom-left'])}
          </div>
          <div className="header-position-layer vertical-bottom horizontal-center">
            {renderHeaderElement(positionMatrix['bottom-center'])}
          </div>
          <div className="header-position-layer vertical-bottom horizontal-right">
            {renderHeaderElement(positionMatrix['bottom-right'])}
          </div>
        </div>
      </header>
    </>
  );
}
