import SidebarForm from "@/components/admin/settings/SidebarFormComplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function SidebarSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de la Barra Lateral</h1>
      
      <Alert className="mb-6 bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Las asignaciones de tema para la barra lateral se configuran en
          <strong className="ml-1">Administración → Configuración → Apariencia → Asignaciones Específicas</strong>
        </AlertDescription>
      </Alert>
      
      <p className="text-muted-foreground mb-6">
        Configura los widgets, la posición y el ancho de la barra lateral del sitio. 
        La barra lateral puede contener diversos widgets como categorías, posts recientes
        o contenido HTML personalizado.
      </p>
      
      <SidebarForm />
    </div>
  );
}
