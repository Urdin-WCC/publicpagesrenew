'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { translations } from '@/app/translations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const BlogSearchForm: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      router.push(`/blog/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={translations.public.searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8 pr-20"
      />
      <Button 
        type="submit" 
        className="absolute right-0 top-0 rounded-l-none"
      >
        {translations.common.search}
      </Button>
    </form>
  );
};

export default BlogSearchForm;
