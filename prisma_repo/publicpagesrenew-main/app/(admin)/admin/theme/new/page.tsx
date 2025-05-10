import PresetForm from '@/components/admin/theme/PresetForm';

export const metadata = {
  title: 'Crear Nuevo Tema - Admin',
  description: 'Crea un nuevo tema visual para tu sitio web',
};

export default function CreateThemePage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Tema</h1>
      <PresetForm isEditing={false} />
    </div>
  );
}
