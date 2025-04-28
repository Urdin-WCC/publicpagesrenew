'use client';

import React from 'react';
import FixedHtmlRenderer from './FixedHtmlRenderer';

interface ClientHtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * Componente cliente que renderiza HTML utilizando FixedHtmlRenderer
 * Diseñado para ser importado dinámicamente desde componentes de servidor
 */
export default function ClientHtmlRenderer({ content, className = '' }: ClientHtmlRendererProps) {
  return (
    <FixedHtmlRenderer content={content} className={className} />
  );
}
