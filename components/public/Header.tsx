import Link from 'next/link';
import { translations } from '@/app/translations'; // Corregir importación

interface MenuItem {
  label: string;
  url: string; // Cambiar a url para coincidir con datos de BD
}

interface HeaderProps {
  menuItems?: MenuItem[];
  siteName?: string;
}

// Usar translations para valor por defecto y mapear url
export default function Header({ menuItems = [], siteName = translations.common.appName }: HeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          {siteName}
        </Link>
        <ul className="flex space-x-4">
          {/* Filtrar items sin url válida antes de mapear */}
          {menuItems
            .filter(item => typeof item.url === 'string' && item.url.trim() !== '')
            .map((item) => (
              <li key={item.url}>
                <Link href={item.url} className="text-gray-600 hover:text-primary">
                  {item.label}
                </Link>
              </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}