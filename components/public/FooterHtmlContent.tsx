'use client';

import React from 'react';
import FixedHtmlRenderer from './FixedHtmlRenderer';

interface FooterHtmlContentProps {
  content: string;
  className?: string;
}

/**
 * Componente cliente para renderizar HTML en el footer
 * Este componente es importado desde el componente de servidor Footer.tsx
 */
export default function FooterHtmlContent({ content, className = '' }: FooterHtmlContentProps) {
  return (
    <div className={`footer-html-content ${className}`} style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <style jsx global>{`
        /* Estilos para asegurar que el contenido HTML del footer se adapte correctamente */
        .footer-html-content img {
          max-width: 100%;
          height: auto;
        }
        .footer-html-content table {
          max-width: 100%;
          overflow-x: auto;
          display: block;
        }
        .footer-html-content iframe, 
        .footer-html-content video,
        .footer-html-content embed,
        .footer-html-content object {
          max-width: 100%;
        }
        .footer-html-content pre,
        .footer-html-content code {
          white-space: pre-wrap;
          word-wrap: break-word;
          max-width: 100%;
          overflow: hidden;
        }
      `}</style>
      <FixedHtmlRenderer content={content} className="w-full" />
    </div>
  );
}
