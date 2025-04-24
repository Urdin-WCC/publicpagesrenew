import React from 'react';
import Link from 'next/link';
import { translations } from '@/app/translations';
import { getGlobalConfig } from '@/lib/config-server';

interface SocialLink {
  platform: string;
  url: string;
  icon?: string; // Optional icon reference
}

interface SocialLinksWidgetProps {
  title?: string;
  config?: {
    iconSize?: 'small' | 'medium' | 'large';
    showLabels?: boolean;
  };
}

// Icon mapping for common social platforms
const socialIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  twitter: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
    </svg>
  ),
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.044.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.976-.044 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.044-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.054-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
    </svg>
  ),
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.2C5.5 8.2 4.7 7.4 4.7 6.5c0-.9.8-1.7 1.8-1.7s1.8.8 1.8 1.7c0 1-.8 1.7-1.8 1.7zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3v-9h3v1.8c1.4-2.6 7-2.8 7 2.4z" />
    </svg>
  ),
  youtube: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M21.582 7.381a2.513 2.513 0 00-1.768-1.768C18.254 5.215 12 5.215 12 5.215s-6.254 0-7.814.398a2.513 2.513 0 00-1.768 1.768C2.019 8.941 2.019 12 2.019 12s0 3.059.399 4.619c.22.77.897 1.347 1.768 1.574 1.56.398 7.814.398 7.814.398s6.254 0 7.814-.398a2.513 2.513 0 001.768-1.765C22.019 15.059 22.019 12 22.019 12s.001-3.059-.437-4.619z" />
      <path d="M10.015 15.138l5.137-3.138-5.137-3.138z" fill="#fff"/>
    </svg>
  ),
};

// Get social links from global config
async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const globalConfig = await getGlobalConfig();
    
    if (!globalConfig?.social) {
      return [];
    }
    
    let socialConfig;
    try {
      socialConfig = typeof globalConfig.social === 'string' 
        ? JSON.parse(globalConfig.social) 
        : globalConfig.social;
    } catch (e) {
      console.error('Error parsing social links JSON:', e);
      return [];
    }
    
    if (!Array.isArray(socialConfig)) {
      return [];
    }
    
    return socialConfig.filter((link: SocialLink) => 
      link.url && link.url.trim() !== '' && 
      link.platform && link.platform.trim() !== ''
    );
  } catch (error) {
    console.error('Error fetching social links:', error);
    return [];
  }
}

export default async function SocialLinksWidget({
  title,
  config = {
    iconSize: 'medium',
    showLabels: true,
  },
}: SocialLinksWidgetProps) {
  const socialLinks = await getSocialLinks();
  
  if (socialLinks.length === 0) {
    return null;
  }
  
  // Map icon sizes to Tailwind classes
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };
  
  const sizeClass = iconSizeClasses[config.iconSize || 'medium'];
  
  return (
    <div className="widget p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="widget-title text-lg font-semibold mb-3">
        {title || "Síguenos"}
      </h3>
      
      <div className={`flex ${config.showLabels ? 'flex-col space-y-3' : 'flex-row flex-wrap gap-4'}`}>
        {socialLinks.map((link, index) => {
          // Normalize platform name for icon lookup
          const platformLower = link.platform.toLowerCase();
          
          return (
            <Link 
              key={index} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center ${config.showLabels ? 'gap-2' : ''} text-gray-700 hover:text-primary transition-colors`}
            >
              <span className="social-icon">
                {socialIcons[platformLower] ? 
                  // If we have a specific icon for this platform
                  <span className={sizeClass}>{socialIcons[platformLower]}</span> :
                  // Default icon if platform not recognized
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={sizeClass}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                }
              </span>
              {config.showLabels && (
                <span className="social-label">{link.platform}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
