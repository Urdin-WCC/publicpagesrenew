"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/app/translations';

interface WidgetSearchProps {
  title: string;
}

export default function WidgetSearch({ title }: WidgetSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirect to a search results page (e.g., /search?q=...)
      // The actual search results page needs to be implemented separately.
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="widget p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="widget-title text-lg font-semibold mb-3">{title || t('common', 'search')}</h3>
      <form onSubmit={handleSearch} className="flex">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Usar traducción sin default
          placeholder={t('public', 'searchPlaceholder')}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:ring-primary focus:border-primary sm:text-sm"
          aria-label={t('common', 'search')}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
          aria-label={t('common', 'search')}
        >
          {/* Search Icon (e.g., SVG or FontAwesome) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
}