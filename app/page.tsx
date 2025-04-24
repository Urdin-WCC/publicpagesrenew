// app/page.tsx
import { redirect } from 'next/navigation';

/**
 * Root Home Redirect
 * 
 * Este componente ha sido modificado para cargar correctamente la implementación
 * de la página de inicio que está en app/(public)/page.tsx.
 * 
 * Para evitar conflictos con las rutas de Next.js, redirigimos a /inicio
 * que debería ser manejado por la página dinámica app/(public)/[slug]/page.tsx,
 * la cual cargará la página de inicio desde la base de datos.
 *
 * @returns Redirección a la página de inicio en la interfaz pública
 */
export default function Home() {
  // Redirigir a la ruta de inicio que será manejada por la página dinámica de slug
  redirect('/inicio');
}
