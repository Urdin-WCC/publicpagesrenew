'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { translations } from '@/app/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

const CategoryDropdown: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog/categories');
        
        if (!response.ok) {
          throw new Error('Error al cargar las categorías');
        }
        
        const data = await response.json();
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      router.push('/blog');
    } else {
      router.push(`/blog/category/${value}`);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder={translations.common.loading} />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder={error} />
        </SelectTrigger>
      </Select>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <Select onValueChange={handleCategoryChange} defaultValue="all">
      <SelectTrigger className="w-full">
        <SelectValue placeholder={translations.public.categories} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las categorías</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.slug}>
            {category.name} {category._count && `(${category._count.posts})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryDropdown;
