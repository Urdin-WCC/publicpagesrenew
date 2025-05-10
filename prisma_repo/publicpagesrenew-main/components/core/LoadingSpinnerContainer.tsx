'use server';

import { getGlobalConfig } from '@/lib/config-server';
import DirectLoadingSpinner from './DirectLoadingSpinner';

export async function LoadingSpinnerContainer() {
  // Obtener la configuración global directamente
  const globalConfig = await getGlobalConfig();
  
  // Renderizar el componente cliente con la configuración global
  return <DirectLoadingSpinner globalConfig={globalConfig} />;
}
