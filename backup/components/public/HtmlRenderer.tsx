'use client';

import { useEffect, useState } from 'react';

interface HtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * Client component that renders HTML content
 */
export default function HtmlRenderer({ content, className = '' }: HtmlRendererProps) {
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to set isClient to true when the component is mounted
  // This ensures that dangerouslySetInnerHTML only runs on the client side
  useEffect(() => {
    setIsClient(true);
    console.log('HtmlRenderer mounted on client side');
  }, []);

  console.log('Rendering HTML content:', content?.substring(0, 100));

  if (!isClient) {
    // Display a placeholder until the component is mounted on the client
    return (
      <div className={`content-html placeholder ${className}`}>
        Loading content...
      </div>
    );
  }

  return (
    <div 
      className={`content-html ${className}`}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
}
