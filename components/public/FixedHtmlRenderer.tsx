'use client';

import { useEffect, useState } from 'react';

interface FixedHtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Fix double-encoded HTML content
 * Takes content like <p>&lt;h1&gt;Title&lt;/h1&gt;</p> and returns <h1>Title</h1>
 */
function fixDoubleEncodedHtml(content: string): string {
  if (!content) return '';
  
  try {
    // First approach: Try direct decode if it looks like proper HTML
    if (/<[a-z][\s\S]*>/i.test(content) && !content.includes('&lt;')) {
      console.log('Content is already proper HTML, returning as is');
      return content;
    }
    
    // Second approach: If we have paragraph tags wrapping encoded HTML content
    if (content.includes('&lt;') && content.includes('<p>')) {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Loop through all paragraphs and decode their contents
      let output = '';
      const paragraphs = tempDiv.querySelectorAll('p');
      
      if (paragraphs.length > 0) {
        paragraphs.forEach(p => {
          // If paragraph contains encoded HTML, decode it
          if (p.innerHTML.includes('&lt;')) {
            // Decode the HTML entities in this paragraph
            const decoded = decodeHtmlEntities(p.innerHTML);
            output += decoded + '\n';
          } else {
            // Regular paragraph, keep as is
            output += `<p>${p.innerHTML}</p>\n`;
          }
        });
        
        console.log('✅ Fixed double-encoded paragraphs');
        return output;
      }
    }
    
    // Third approach: Try simple entity decode for the whole content
    if (content.includes('&lt;')) {
      const decoded = decodeHtmlEntities(content);
      console.log('✅ Fixed double-encoded HTML with direct decode');
      return decoded;
    }
    
    // If we got here, just return the original content
    return content;
  } catch (e) {
    console.error('Error fixing double-encoded HTML:', e);
    return content;
  }
}

/**
 * Client component that renders HTML content and fixes double-encoding issues
 */
export default function FixedHtmlRenderer({ content, className = '' }: FixedHtmlRendererProps) {
  const [fixedContent, setFixedContent] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Fix double-encoded HTML on client side
    const fixed = fixDoubleEncodedHtml(content);
    setFixedContent(fixed);
    
    console.log('FixedHtmlRenderer mounted on client side');
  }, [content]);

  if (!isClient) {
    // Display a placeholder until the component is mounted on the client
    return (
      <div className={`content-html placeholder ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-full mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-5/6 mb-2"></div>
      </div>
    );
  }

  return (
    <div 
      className={`content-html ${className}`}
      dangerouslySetInnerHTML={{ __html: fixedContent }}
    />
  );
}
