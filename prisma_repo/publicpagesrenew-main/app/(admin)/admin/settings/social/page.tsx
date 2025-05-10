import SocialForm from "@/components/admin/settings/SocialForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function SocialSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de Redes Sociales</h1>
      
      <Alert className="mb-6 bg-blue-50">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Configura las redes sociales de tu sitio web para mostrar enlaces a tus perfiles en redes sociales.
        </AlertDescription>
      </Alert>
      
      <p className="text-muted-foreground mb-6">
        Añade, edita o elimina enlaces a tus redes sociales. Puedes personalizar el nombre,
        la URL, añadir un icono y configurar si el enlace se abre en una nueva pestaña.
      </p>
      
      <SocialForm />
    </div>
  );
}
