import { translations } from '@/app/translations';

interface WidgetConfig {
  id: string;
  type: string;
}

interface FooterProps {
  text?: string;
  widgets?: WidgetConfig[];
}

export default function Footer({ text = `© ${new Date().getFullYear()} ${translations.common.appName}. Todos los derechos reservados.`, widgets = [] }: FooterProps) {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        {widgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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