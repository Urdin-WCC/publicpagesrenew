'use client';

import React from 'react';
import FixedHtmlRenderer from '@/components/public/FixedHtmlRenderer';

interface WidgetCustomHtmlProps {
  title?: string;
  content?: string;
}

/**
 * Componente para renderizar HTML personalizado en widgets
 * Utiliza FixedHtmlRenderer para manejar correctamente todo tipo de contenido HTML
 */
export default function WidgetCustomHtml({ title, content = '' }: WidgetCustomHtmlProps) {
  if (!content) {
    return null;
  }

  return (
    <div className="widget-custom-html">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <FixedHtmlRenderer content={content} className="w-full" />
    </div>
  );
}
