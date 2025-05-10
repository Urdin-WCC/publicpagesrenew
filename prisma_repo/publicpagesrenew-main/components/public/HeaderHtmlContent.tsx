'use client';

import React from 'react';
import FixedHtmlRenderer from './FixedHtmlRenderer';

interface HeaderHtmlContentProps {
  content: string;
  className?: string;
}

/**
 * Componente cliente para renderizar HTML en el header
 * Este componente es importado desde el componente de servidor Header.tsx
 */
export default function HeaderHtmlContent({ content, className = '' }: HeaderHtmlContentProps) {
  return (
    <div className={`header-html-content ${className}`}>
      <FixedHtmlRenderer content={content} className="w-full" />
    </div>
  );
}
