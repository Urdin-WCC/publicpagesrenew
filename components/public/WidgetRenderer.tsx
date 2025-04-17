import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Importar dinámicamente los componentes de widgets
const LatestProjectsWidget = dynamic(() => import('./widgets/LatestProjectsWidget'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

// Tipo para el widget
interface Widget {
  type: string;
  title?: string;
  config?: any;
}

interface WidgetRendererProps {
  widget: Widget;
}

// Componente de esqueleto para carga
function WidgetSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WidgetRenderer({ widget }: WidgetRendererProps) {
  // Renderizar el widget según su tipo
  switch (widget.type) {
    case 'latest_projects':
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "Proyectos recientes"} />}>
          <LatestProjectsWidget 
            limit={widget.config?.limit || 5} 
            showFeaturedOnly={widget.config?.showFeaturedOnly || false} 
          />
        </Suspense>
      );
    // Aquí se pueden añadir más tipos de widgets
    default:
      return null;
  }
}
