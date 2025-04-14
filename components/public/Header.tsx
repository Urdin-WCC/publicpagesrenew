import Link from 'next/link';
import { t } from '@/app/translations';

interface MenuItem {
  label: string;
  href: string;
}

interface HeaderProps {
  menuItems?: MenuItem[];
  siteName?: string;
}

export default function Header({ menuItems = [], siteName = t('common', 'appName') }: HeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          {siteName}
        </Link>
        <ul className="flex space-x-4">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-gray-600 hover:text-primary">
                {item.label}
              </Link>
            </li>
          ))}
          {/* Placeholder for potential future items like login/profile */}
        </ul>
      </nav>
    </header>
  );
}