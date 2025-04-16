import { NextResponse } from 'next/server';
import { getGlobalConfig } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const globalConfig = await getGlobalConfig();
    
    // Obtener la configuración de la barra lateral
    const sidebarConfig = globalConfig?.sidebar || { 
      widgets: [],
      position: 'right',
      width: '320px'
    };
    
    return NextResponse.json(sidebarConfig);
  } catch (error) {
    console.error('Error fetching sidebar config:', error);
    return NextResponse.json(
      { message: 'Error al obtener la configuración de la barra lateral' },
      { status: 500 }
    );
  }
}
