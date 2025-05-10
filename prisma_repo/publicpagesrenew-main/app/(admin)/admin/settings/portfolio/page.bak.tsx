import PortfolioFormComplete from "@/components/admin/settings/PortfolioFormComplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function PortfolioSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Portfolio</h1>
      
      <Alert className="mb-6 bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Las asignaciones de tema para el portfolio se configuran en
          <strong>' Administración → Configuración → Apariencia → Asignaciones Específicas '</strong>
        </AlertDescription>
      </Alert>
      
      <p className="text-muted-foreground mb-6">
        Configura cómo se mostrará la sección de portfolio en el sitio público.
        Puedes ajustar el número de proyectos por página, el tipo de visualización predeterminado
        y si deseas mostrar la barra lateral en las diferentes vistas.
      </p>
      
      <PortfolioFormComplete />
    </div>
  );
}
