'use client';

import { useEffect, useState } from 'react';
import { translations } from '@/app/translations';
import Image from 'next/image';

interface LoadingSpinnerConfig {
  backgroundColor?: string;
  spinnerColor?: string;
  spinnerImage?: string;
  text?: string;
  enabled?: boolean;
  textColor?: string;
  size?: string;
  overlay?: boolean;
}

interface LoadingSpinnerProps {
  config?: LoadingSpinnerConfig;
}

export default function LoadingSpinner({ config }: LoadingSpinnerProps) {
  const [visible, setVisible] = useState(true);
  
  // Parse configuration with defaults
  const spinnerConfig = {
    backgroundColor: config?.backgroundColor || 'bg-black bg-opacity-50',
    spinnerColor: config?.spinnerColor || 'border-primary',
    spinnerImage: config?.spinnerImage || '',
    size: config?.size || 'h-16 w-16',
    textColor: config?.textColor || 'text-white',
    text: config?.text || translations.common.loading,
    enabled: config?.enabled !== false, // Default to true
    overlay: config?.overlay !== false // Default to true
  };
  
  useEffect(() => {
    // Hide spinner when page is fully loaded
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        handlePageLoad();
      } else {
        window.addEventListener('load', handlePageLoad);
        
        // Fallback timeout to prevent spinner from being stuck
        const fallbackTimer = setTimeout(() => {
          console.log('LoadingSpinner: Fallback triggered after 8s');
          setVisible(false);
        }, 8000);
        
        return () => {
          window.removeEventListener('load', handlePageLoad);
          clearTimeout(fallbackTimer);
        };
      }
    }
    
    // If spinner is disabled in config, hide it immediately
    if (!spinnerConfig.enabled) {
      setVisible(false);
    }
  }, [spinnerConfig.enabled]);
  
  // Handle page load event
  const handlePageLoad = () => {
    console.log('LoadingSpinner: Page fully loaded');
    setVisible(false);
  };
  
  // Don't render if spinner is disabled or not visible
  if (!spinnerConfig.enabled || !visible) {
    return null;
  }
  
  return (
    <div 
      id="loading-spinner" 
      className={`fixed inset-0 ${spinnerConfig.backgroundColor} flex flex-col items-center justify-center z-50`}
      role="status"
      aria-live="polite"
    >
      {/* Custom spinner image or default animated spinner */}
      {spinnerConfig.spinnerImage ? (
        <div>
          <Image 
            src={spinnerConfig.spinnerImage}
            alt={spinnerConfig.text}
            width={100}
            height={100}
            className={spinnerConfig.size}
            unoptimized // For GIFs to animate
          />
        </div>
      ) : (
        <div className={`animate-spin rounded-full ${spinnerConfig.size} border-t-2 border-b-2 ${spinnerConfig.spinnerColor}`}></div>
      )}
      
      {/* Loading text */}
      <div className={`mt-4 ${spinnerConfig.textColor} font-medium`}>{spinnerConfig.text}</div>
      
      {/* Debug info - remove in production */}
      <div className="absolute bottom-4 left-4 text-xs bg-white bg-opacity-80 text-black p-2 rounded">
        <p>Spinner Configuration:</p>
        <ul className="list-disc list-inside">
          <li>Enabled: {spinnerConfig.enabled ? 'Yes' : 'No'}</li>
          <li>Custom Image: {spinnerConfig.spinnerImage ? 'Yes' : 'No'}</li>
          <li>Background: {spinnerConfig.backgroundColor}</li>
        </ul>
      </div>
    </div>
  );
}
