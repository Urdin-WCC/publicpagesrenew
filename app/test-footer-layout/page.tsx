'use client';

import Footer from '@/components/public/Footer';

// Config de preset para test de borde/sombra/radio extremos
const testConfig = {
  widgets: [
    {
      id: 'test-widget',
      title: 'Widget de Test',
      type: 'text',
      content: 'Widget TEST - borde, radio, shadow',
      config: {}
    }
  ],
  columns: 1,
  secondaryHtml: '',
  height: 'auto',
  visible: true
};

// Simulación de preset theme extremo (en globalConfig)
const testGlobalConfig = {
  defaultLightThemePresetId: 1,
  defaultDarkThemePresetId: 1,
  themeAssignments: {},
  // Definición directa de las variables de footer-cards más destacadas
  config: {
    '--footer-cards-borderColor': '#00FF00', // verde intenso
    '--footer-cards-borderWidth': '8px',
    '--footer-cards-borderRadius': '50px',
    '--footer-cards-boxShadow': '0 0 24px 4px #009900',
    '--footer-cards-background': '#fff',
    '--footer-cards-color': '#000',
    '--footer-cards-padding': '24px',
    '--footer-cards-margin': '24px',
    '--footer-cards-fontFamily': 'Comic Sans MS, cursive, sans-serif',
    '--footer-cards-fontWeight': 'bold',
    '--footer-cards-fontSize': '1.2rem'
  }
};

export default function TestFooterLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#ececec', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Forzar inline style con variables de theming del test */}
      <footer
        className="footer-component"
        style={{
          ...(testGlobalConfig.config || {}),
          background: '#eee'
        }}
      >
        <Footer
          config={testConfig}
          globalConfig={testGlobalConfig}
          pathname="/test-footer-layout"
          stickyClass=""
        />
      </footer>
    </div>
  );
}
