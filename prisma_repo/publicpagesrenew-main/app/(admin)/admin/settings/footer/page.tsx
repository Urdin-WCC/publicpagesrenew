import FooterForm from "@/components/admin/settings/FooterFormComplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function FooterSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Pie de Página</h1>
      
      <Alert className="mb-6 bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Las asignaciones de tema para el pie de página se configuran en
          <strong className="ml-1">Administración → Configuración → Apariencia → Asignaciones Específicas</strong>
        </AlertDescription>
      </Alert>
      
      <p className="text-muted-foreground mb-6">
        Configura los widgets, la altura y el contenido HTML secundario del pie de página.
        El pie de página puede contener diversos widgets como categorías, posts recientes,
        o contenido HTML personalizado.
      </p>
      
      <FooterForm />
    </div>
  );
}
