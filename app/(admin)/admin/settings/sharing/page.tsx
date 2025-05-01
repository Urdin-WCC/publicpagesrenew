import SharingForm from "@/components/admin/settings/SharingForm";

export default function SharingSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de Botones para Compartir</h1>
      <p className="text-muted-foreground mb-6">
        Configura los botones que permitirán a los usuarios compartir tu contenido en 
        redes sociales y otros medios. Para cada botón, puedes definir el nombre,
        la URL base para compartir, el icono para modo claro/oscuro (o una URL SVG personalizada), y el orden en que aparecerán.
      </p>
      <SharingForm />
    </div>
  );
}
