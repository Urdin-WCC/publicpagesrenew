'use client'; // Necesita ser cliente para usar hooks como useSearchParams o para botones interactivos

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation'; // Para construir URLs dinámicamente
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '@/app/translations';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath?: string; // Opcional, por si se usa en otras secciones (ej. /portfolio)
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  basePath = '/blog', // Default para el blog
}) => {
  const pathname = usePathname(); // Obtener ruta actual
  const searchParams = useSearchParams(); // Obtener parámetros actuales

  // Función para crear la URL de la página
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    // Usar basePath si la ruta actual no coincide (ej. si estamos en /blog/search)
    const targetPath = pathname.startsWith(basePath) ? pathname : basePath;
    return `${targetPath}?${params.toString()}`;
  };

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Lógica opcional para mostrar números de página (simplificado por ahora)
  // const getPageNumbers = () => { ... }

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Botón Anterior */}
      <Button
        variant="outline"
        size="icon"
        disabled={!hasPreviousPage}
        asChild={hasPreviousPage} // Convertir a Link si está habilitado
      >
        {hasPreviousPage ? (
          <Link href={createPageURL(currentPage - 1)} aria-label={translations.common.previous}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Indicador de página actual (simplificado) */}
      <span className="text-sm font-medium">
        Página {currentPage} de {totalPages}
      </span>

      {/* Botón Siguiente */}
       <Button
        variant="outline"
        size="icon"
        disabled={!hasNextPage}
        asChild={hasNextPage} // Convertir a Link si está habilitado
      >
        {hasNextPage ? (
          <Link href={createPageURL(currentPage + 1)} aria-label={translations.common.next}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default PaginationControls;