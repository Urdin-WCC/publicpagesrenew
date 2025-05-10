import { getGlobalConfig } from '@/lib/config-server';
import { withRoleProtection } from '@/lib/auth';
import SEOSettingsForm from '@/components/admin/seo/SEOSettingsForm';

// Role protection: Only ADMIN or higher roles can access this page
export const beforeRender = withRoleProtection('ADMIN');

export default async function SEOSettingsPage() {
  // Get the global config with SEO settings
  const config = await getGlobalConfig();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Configuración SEO Global</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <SEOSettingsForm initialData={config as any} />
      </div>
    </div>
  );
}
