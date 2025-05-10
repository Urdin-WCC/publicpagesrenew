import HeaderForm from "@/components/admin/settings/HeaderFormComplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function HeaderSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Encabezado</h1>
      
      <Alert className="mb-6 bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Las asignaciones de tema para el encabezado se configuran en
          <strong className="ml-1">Administración → Configuración → Apariencia → Asignaciones Específicas</strong>
        </AlertDescription>
      </Alert>
      
      <p className="text-muted-foreground mb-6">
        Configura los elementos del encabezado del sitio como logo, texto, menú de navegación, 
        iconos de redes sociales y más. Puedes activar o desactivar elementos y
        ajustar su posición dentro del encabezado.
      </p>
      
      <HeaderForm />
    </div>
  );
}
