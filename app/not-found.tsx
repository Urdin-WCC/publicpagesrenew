import Link from 'next/link';
import { translations } from '@/app/translations';

/**
 * Custom 404 Not Found page.
 * Uses translations from the 'errorPages' group.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      {/* Adjust min-h based on actual header/footer height if needed */}
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{translations.errorPages.notFound}</h2>
      <p className="text-lg text-gray-600 mb-8">{translations.errorPages.notFoundDescription}</p>
      <Link href="/" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">
        {translations.errorPages.goHome}
      </Link>
    </div>
  );
}