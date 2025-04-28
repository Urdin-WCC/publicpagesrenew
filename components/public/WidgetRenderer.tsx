import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Define our widget types to match those in WIDGET_TYPES from lib/constants.ts
const WidgetTypes = {
  LATEST_POSTS: 'latest_posts',
  LATEST_PROJECTS: 'latest_projects',
  SOCIAL_LIST: 'social_list',
  CONTACT_FORM: 'contact_form',
  CONTACT_DATA: 'contact_data',
  MAP: 'map',
  CUSTOM_HTML: 'custom_html',
  LOGO: 'logo',
  NAVIGATION: 'navigation',
  DEVELOPER_HTML: 'WidgetDeveloperHTML',
  SEARCH: 'SEARCH',
  CATEGORIES: 'CATEGORIES', 
  TAGS: 'TAGS'
};

// Dynamically import widget components to avoid loading all of them at once
const LatestProjectsWidget = dynamic(() => import('./widgets/LatestProjectsWidget'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

const LatestPostsWidget = dynamic(() => import('./widgets/WidgetLatestPosts'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

const SearchWidget = dynamic(() => import('./widgets/WidgetSearch'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

const DeveloperHTMLWidget = dynamic(() => import('./widgets/WidgetDeveloperHTML'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

const CategoriesWidget = dynamic(() => import('./widgets/WidgetCategories'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

const SocialLinksWidget = dynamic(() => import('./widgets/SocialLinksWidget'), {
  loading: () => <WidgetSkeleton title="Cargando..." />,
  ssr: true,
});

// Define the widget interface based on DB model
interface Widget {
  id: string;
  title: string;
  type: string;  // Changed from WidgetType to string
  content?: string | null;
  config?: any;
  order?: number;
  isActive?: boolean;
  sectionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WidgetRendererProps {
  widget: Widget;
}

// Skeleton component for loading state
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
  // Map from widget type to component
  switch (widget.type) {
    case WidgetTypes.LATEST_PROJECTS:
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "Proyectos recientes"} />}>
          <LatestProjectsWidget 
            // Only pass props that the component accepts
            limit={widget.config?.limit || 5}
            showFeaturedOnly={widget.config?.showFeaturedOnly || false}
          />
        </Suspense>
      );
    
    case WidgetTypes.LATEST_POSTS:
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "Publicaciones recientes"} />}>
          <LatestPostsWidget 
            title={widget.title}
            config={widget.config}
          />
        </Suspense>
      );
      
    case WidgetTypes.SEARCH:
    case 'SEARCH': // Include both formats
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "Buscar"} />}>
          <SearchWidget 
            title={widget.title}
          />
        </Suspense>
      );
      
    // Special widget for developer custom HTML 
    case WidgetTypes.DEVELOPER_HTML:
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "HTML personalizado"} />}>
          <DeveloperHTMLWidget />
        </Suspense>
      );
    case WidgetTypes.CATEGORIES:
    case 'CATEGORIES':
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "Categorías"} />}>
          <CategoriesWidget 
            title={widget.title}
            config={widget.config || {}}
          />
        </Suspense>
      );
    case WidgetTypes.TAGS:
    case 'TAGS':
    case WidgetTypes.SOCIAL_LIST:
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "Redes Sociales"} />}>
          <SocialLinksWidget 
            title={widget.title}
            config={widget.config || {}}
          />
        </Suspense>
      );
    case WidgetTypes.CONTACT_FORM:
    case WidgetTypes.CONTACT_DATA:
    case WidgetTypes.MAP:
    case WidgetTypes.CUSTOM_HTML:
      const CustomHtmlWidget = dynamic(() => import('./widgets/WidgetCustomHtml'), {
        loading: () => <WidgetSkeleton title="Cargando HTML..." />,
        ssr: true,
      });
      
      return (
        <Suspense fallback={<WidgetSkeleton title={widget.title || "HTML personalizado"} />}>
          <CustomHtmlWidget 
            title={widget.title}
            content={widget.content || ''}
          />
        </Suspense>
      );
    case WidgetTypes.LOGO:
    case 'logo':
      return (
        <a href="/" style={{ display: "block", width: "100%", height: "100%" }}>
          <img
            src="/images/logo.img"
            alt="Logo"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              margin: "0 auto"
            }}
          />
        </a>
      );
    case WidgetTypes.NAVIGATION:
      return (
        <Card>
          <CardHeader>
            <CardTitle>{widget.title || "Widget"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {`Widget de tipo "${widget.type}" - Próximamente disponible`}
            </p>
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>{widget.title || "Widget desconocido"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Tipo de widget no reconocido
            </p>
          </CardContent>
        </Card>
      );
  }
}
