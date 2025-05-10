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
    <div className={`footer-html-content ${className}`}>
      <FixedHtmlRenderer content={content} className="w-full" />
    </div>
  );
}
