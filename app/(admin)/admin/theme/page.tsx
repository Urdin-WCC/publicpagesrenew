import PresetList from '@/components/admin/theme/PresetList';

export const metadata = {
  title: 'Gestión de Temas Visuales - Admin',
  description: 'Administra los temas visuales de tu sitio web',
};

export default function ThemeAdminPage() {
  return (
    <div className="container py-6">
      <PresetList />
    </div>
  );
}
