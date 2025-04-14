import { t } from '@/app/translations';

// Placeholder para la estructura de un widget
interface WidgetConfig {
  id: string;
  type: string; // e.g., 'latestPosts', 'search', 'categories'
  // ... otras propiedades específicas del widget
}

interface FooterProps {
  text?: string;
  widgets?: WidgetConfig[]; // Placeholder para la configuración de widgets
}

export default function Footer({ text = `© ${new Date().getFullYear()} ${t('common', 'appName')}. Todos los derechos reservados.`, widgets = [] }: FooterProps) {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Placeholder para renderizar widgets */}
        {widgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* TODO: Mapear widgets y renderizar componentes correspondientes */}
            <p>Widgets irían aquí...</p>
          </div>
        )}
        <div className="text-center text-sm text-gray-500">
          {text}
        </div>
      </div>
    </footer>
  );
}