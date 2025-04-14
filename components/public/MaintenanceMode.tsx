import { t } from '@/app/translations';

/**
 * Component displayed when the site is in maintenance mode.
 */
export default function MaintenanceMode() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">{t('common', 'maintenanceModeTitle')}</h1>
      <p className="text-lg text-gray-600">{t('common', 'maintenanceModeText')}</p>
      {/* Optionally add an icon or image */}
    </div>
  );
}