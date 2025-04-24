import { NextRequest, NextResponse } from 'next/server';
import { getGlobalConfig } from '@/lib/config-server';
import { getThemeConfigsForComponent, generateCssFromThemeConfigs } from '@/lib/themeUtils';

/**
 * API endpoint to get theme CSS for a specific component
 * This is used by client components that can't directly use server functions
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const componentName = searchParams.get('component');
    const pathname = searchParams.get('pathname') || '/';
    
    console.log(`API: Getting theme for component "${componentName}" at path "${pathname}"`);
    
    // Check if component name is provided
    if (!componentName) {
      console.log('API Error: Component name is required');
      return NextResponse.json({ error: 'Component name is required' }, { status: 400 });
    }
    
    // Get global config for theme assignments
    const globalConfig = await getGlobalConfig();
    
    if (!globalConfig) {
      console.log('API Error: Global config not found');
      return NextResponse.json({ error: 'Global config not found' }, { status: 404 });
    }
    
    console.log(`API: Global config loaded, getting theme configs for ${componentName}`);
    
    // Get theme configuration for the component
    const { lightConfig, darkConfig } = await getThemeConfigsForComponent(
      componentName, 
      pathname.toString(), 
      globalConfig
    );
    
    console.log(`API: Got theme configs for ${componentName}:`, 
      { lightPresent: !!lightConfig, darkPresent: !!darkConfig });
    
    // Generate CSS with a selector specific to this component
    const css = generateCssFromThemeConfigs(
      lightConfig, 
      darkConfig, 
      `.${componentName}-component`
    );
    
    console.log(`API: Generated CSS (${css.length} chars) for ${componentName}`);
    
    // Return the generated CSS
    return NextResponse.json({ 
      css,
      component: componentName,
      path: pathname,
      success: true
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error getting component theme:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
