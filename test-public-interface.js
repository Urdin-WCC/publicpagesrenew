// Script to test the public interface configuration
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  try {
    console.log("==== Testing Public Interface Configuration ====");

    // 1. Check the GlobalConfig values
    console.log("\n1. GlobalConfig Configuration:");
    
    // Use direct SQL to get all values
    const configResult = await prisma.$queryRaw`
      SELECT * FROM GlobalConfig WHERE id = 'global'
    `;
    
    if (!configResult || configResult.length === 0) {
      console.log("No global config found!");
      return;
    }
    
    const config = configResult[0];
    
    // Debug raw values
    console.log("Raw values:");
    console.log(`defaultLightThemePresetId: ${config.defaultLightThemePresetId} (${typeof config.defaultLightThemePresetId})`);
    console.log(`defaultDarkThemePresetId: ${config.defaultDarkThemePresetId} (${typeof config.defaultDarkThemePresetId})`);
    console.log(`navigationMenu type: ${typeof config.navigationMenu}`);
    console.log(`navigationMenu length: ${config.navigationMenu ? config.navigationMenu.length : 'N/A'}`);
    console.log(`themeAssignments type: ${typeof config.themeAssignments}`);
    console.log(`themeAssignments length: ${config.themeAssignments ? config.themeAssignments.length : 'N/A'}`);
    
    // Show beginning of raw strings
    if (typeof config.navigationMenu === 'string' && config.navigationMenu) {
      console.log(`navigationMenu (first 100 chars): ${config.navigationMenu.substring(0, 100)}`);
    }
    if (typeof config.themeAssignments === 'string' && config.themeAssignments) {
      console.log(`themeAssignments (first 100 chars): ${config.themeAssignments.substring(0, 100)}`);
    }

    // Parse and validate JSON fields or objects
    const parseJsonField = (fieldName, fieldValue) => {
      if (!fieldValue) {
        return { valid: false, error: 'Field is null or undefined', parsed: null };
      }
      
      // If it's already an object
      if (typeof fieldValue === 'object') {
        return { valid: true, parsed: fieldValue };
      }
      
      // If it's a string, try to parse it
      try {
        const parsed = JSON.parse(fieldValue);
        return { valid: true, parsed };
      } catch (e) {
        console.log(`Error parsing ${fieldName}:`, e.message);
        return { valid: false, error: e.message, parsed: null };
      }
    };
    
    console.log(`Header config valid: ${parseJsonField('header', config.header).valid}`);
    console.log(`Footer config valid: ${parseJsonField('footer', config.footer).valid}`);
    console.log(`Sidebar config valid: ${parseJsonField('sidebar', config.sidebar).valid}`);
    console.log(`Navigation menu valid: ${parseJsonField('navigationMenu', config.navigationMenu).valid}`);
    console.log(`Theme assignments valid: ${parseJsonField('themeAssignments', config.themeAssignments).valid}`);
    
    // 2. Check theme presets
    console.log("\n2. Theme Preset Availability:");
    try {
      // Use SQL query to avoid model type mismatch issues
      const lightThemeResult = await prisma.$queryRaw`
        SELECT config FROM ThemePreset WHERE id = ${config.defaultLightThemePresetId}
      `;
      
      const darkThemeResult = await prisma.$queryRaw`
        SELECT config FROM ThemePreset WHERE id = ${config.defaultDarkThemePresetId}
      `;
      
      console.log(`Light theme (ID: ${config.defaultLightThemePresetId}) available: ${lightThemeResult.length > 0}`);
      console.log(`Dark theme (ID: ${config.defaultDarkThemePresetId}) available: ${darkThemeResult.length > 0}`);
      
      // Validate theme configs
      if (lightThemeResult.length > 0) {
        const lightThemeValid = parseJsonField('lightTheme', lightThemeResult[0].config).valid;
        console.log(`Light theme config valid: ${lightThemeValid}`);
      }
      
      if (darkThemeResult.length > 0) {
        const darkThemeValid = parseJsonField('darkTheme', darkThemeResult[0].config).valid;
        console.log(`Dark theme config valid: ${darkThemeValid}`);
      }
    } catch (error) {
      console.error("Error checking theme presets:", error);
    }

    // 3. Test component visibility settings
    console.log("\n3. Component Visibility Settings:");
    const navMenu = parseJsonField('navigationMenu', config.navigationMenu).parsed;
    if (navMenu) {
      console.log(`Navigation menu items: ${navMenu.length}`);
      console.log("Menu items:", navMenu.map(item => `${item.label} -> ${item.target}`));
    }

    // 4. Create test HTML file to display the configuration
    console.log("\n4. Creating test HTML file...");
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Public Interface Test</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { color: #2563eb; }
    h2 { color: #4338ca; margin-top: 2rem; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow: auto; }
    .json { color: #1e40af; }
    .highlight { background: #fef3c7; padding: 0.25rem; }
    .error { color: #dc2626; font-weight: bold; }
    .success { color: #16a34a; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Public Interface Configuration Test</h1>
  
  <h2>1. Global Configuration</h2>
  <p>Site Name: <span class="highlight">${config.siteName}</span></p>
  <p>Header Configuration: <span class="${parseJsonField('header', config.header).valid ? 'success' : 'error'}">${parseJsonField('header', config.header).valid ? 'Valid' : 'Invalid'}</span></p>
  <p>Footer Configuration: <span class="${parseJsonField('footer', config.footer).valid ? 'success' : 'error'}">${parseJsonField('footer', config.footer).valid ? 'Valid' : 'Invalid'}</span></p>
  <p>Sidebar Configuration: <span class="${parseJsonField('sidebar', config.sidebar).valid ? 'success' : 'error'}">${parseJsonField('sidebar', config.sidebar).valid ? 'Valid' : 'Invalid'}</span></p>
  <p>Navigation Menu: <span class="${parseJsonField('navigationMenu', config.navigationMenu).valid ? 'success' : 'error'}">${parseJsonField('navigationMenu', config.navigationMenu).valid ? 'Valid' : 'Invalid'}</span></p>
  
  <h2>2. Theme Settings</h2>
  <p>Default Light Theme ID: <span class="highlight">${config.defaultLightThemePresetId}</span></p>
  <p>Default Dark Theme ID: <span class="highlight">${config.defaultDarkThemePresetId}</span></p>
  <p>Theme Assignments: <span class="${parseJsonField('themeAssignments', config.themeAssignments).valid ? 'success' : 'error'}">${parseJsonField('themeAssignments', config.themeAssignments).valid ? 'Valid' : 'Invalid'}</span></p>
  
  <h2>3. Navigation Menu</h2>
  <ul>
    ${navMenu ? navMenu.map(item => `<li><strong>${item.label}</strong>: ${item.target}</li>`).join('') : '<li class="error">No menu items or invalid format</li>'}
  </ul>
  
  <h2>4. Configuration Details</h2>
  <h3>Header Configuration</h3>
  <pre class="json">${config.header ? formatJson(config.header) : 'Not available'}</pre>
  
  <h3>Footer Configuration</h3>
  <pre class="json">${config.footer ? formatJson(config.footer) : 'Not available'}</pre>
  
  <h3>Sidebar Configuration</h3>
  <pre class="json">${config.sidebar ? formatJson(config.sidebar) : 'Not available'}</pre>
  
  <h3>Navigation Menu</h3>
  <pre class="json">${config.navigationMenu ? formatJson(config.navigationMenu) : 'Not available'}</pre>
  
  <h3>Theme Assignments</h3>
  <pre class="json">${config.themeAssignments ? formatJson(config.themeAssignments) : 'Not available'}</pre>
  
  <script>
    // Script to help debug initialization issues
    console.log("Test page loaded");
    
    // Add PageConfig for testing
    window.__PAGE_CONFIG__ = {
      showHeader: true,
      showFooter: true,
      showSidebar: true,
      sidebarPosition: 'right'
    };
    console.log("PageConfig set:", window.__PAGE_CONFIG__);
  </script>
</body>
</html>`;

    fs.writeFileSync('public-interface-test.html', html);
    console.log("Test HTML file created: public-interface-test.html");

  } catch (error) {
    console.error("Error testing configuration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to format JSON or objects with indentation
function formatJson(value) {
  try {
    // If it's an object, stringify it directly
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    
    // If it's a string, try to parse and then stringify
    if (typeof value === 'string') {
      return JSON.stringify(JSON.parse(value), null, 2);
    }
    
    // If it's neither, convert to string
    return String(value);
  } catch (e) {
    console.log("Error formatting:", e.message);
    return `Invalid JSON: ${String(value)}`;
  }
}

main();
