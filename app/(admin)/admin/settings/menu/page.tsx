import { Metadata } from "next";
import NavigationMenuForm from "@/components/admin/settings/NavigationMenuForm";

export const metadata: Metadata = {
  title: "Configuración del Menú de Navegación | Panel de Administración",
  description: "Configurar los elementos del menú de navegación del sitio web",
};

export default function NavigationMenuPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración del Menú de Navegación</h1>
      <p className="text-muted-foreground mb-6">
        Configura los elementos que aparecerán en el menú de navegación principal del sitio. 
        Este menú es utilizado en la cabecera del sitio y puede ser incorporado en el pie de página 
        y la barra lateral mediante widgets.
      </p>
      <NavigationMenuForm />
    </div>
  );
}
