'use client';

import { useEffect } from 'react';

/**
 * Componente cliente que maneja las clases CSS basadas en la configuración de la página.
 * Este componente solo se ejecuta en el cliente, después de la hidratación,
 * para evitar discrepancias entre el servidor y el cliente.
 */
export default function PageConfigHandler() {
  // Este efecto solo se ejecuta en el cliente, después de la hidratación.
  useEffect(() => {
    function applyPageConfigClasses() {
      if (typeof window === 'undefined' || !window.__PAGE_CONFIG__) return;
      
      const config = window.__PAGE_CONFIG__;
      const body = document.body;
      
      // Añadir o remover clases basadas en la configuración de la página
      if (config.showHeader === false) {
        body.classList.add('hide-header');
      } else {
        body.classList.remove('hide-header');
      }
      
      if (config.showFooter === false) {
        body.classList.add('hide-footer');
      } else {
        body.classList.remove('hide-footer');
      }
      
      if (config.showSidebar === true) {
        body.classList.add('show-sidebar');
        body.classList.add(`sidebar-${config.sidebarPosition || 'right'}`);
      } else {
        body.classList.remove('show-sidebar');
        body.classList.remove('sidebar-left', 'sidebar-right');
      }
    }
    
    // Aplicar las clases inmediatamente
    applyPageConfigClasses();
    
    // Y también cuando cambie la configuración de la página
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const scripts = Array.from(document.getElementsByTagName('script'));
          const configScript = scripts.find(script => 
            script.innerHTML.includes('window.__PAGE_CONFIG__')
          );
          
          if (configScript) {
            // Solo ejecutar una vez después de que se detecte el script
            applyPageConfigClasses();
          }
        }
      });
    });
    
    // Observar solo las adiciones de scripts
    observer.observe(document.head, { childList: true });
    
    // Limpiar al desmontar
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Este componente no renderiza nada visible
  return null;
}
