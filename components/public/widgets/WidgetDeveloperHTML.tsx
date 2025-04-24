/**
 * Widget para renderizar contenido HTML personalizado por un administrador Master.
 * 
 * IMPORTANTE SEGURIDAD: Este componente utiliza dangerouslySetInnerHTML, lo cual puede 
 * crear vulnerabilidades de seguridad (XSS). La protección depende enteramente de la 
 * restricción de acceso a la página de administración que permite editar este contenido, 
 * la cual está restringida exclusivamente al rol MASTER.
 */

import { getGlobalConfig } from "@/lib/config-server";

interface WidgetProps {
  // Se puede extender con propiedades adicionales si es necesario
}

/**
 * Componente para renderizar HTML personalizado ingresado por un administrador Master
 * 
 * Este widget se puede utilizar en el sidebar, footer u otras secciones del sitio.
 * El contenido HTML es completamente arbitrario y se renderiza con dangerouslySetInnerHTML.
 */
export async function WidgetDeveloperHTML({}: WidgetProps) {
  // Obtener la configuración global que contiene el contenido HTML personalizado
  const globalConfig = await getGlobalConfig();
  
  // Extraer el contenido HTML (puede ser undefined o null)
  const htmlContent = globalConfig?.developerHtmlContent;

  // Solo renderizar si hay contenido HTML
  if (!htmlContent) {
    return null;
  }

  return (
    <div className="widget-developer-html">
      {/* 
        ADVERTENCIA DE SEGURIDAD:
        El uso de dangerouslySetInnerHTML puede permitir ataques XSS si el HTML no es seguro.
        En este caso, la seguridad se basa en que solo los usuarios con rol MASTER pueden 
        editar este contenido, por lo que se asume que son administradores confiables.
      */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default WidgetDeveloperHTML;
