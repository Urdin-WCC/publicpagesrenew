-- Intentar crear la columna, si ya existe fallará pero es un error seguro
ALTER TABLE GlobalConfig ADD COLUMN navigationMenu LONGTEXT;

-- Actualizar el valor del menú de navegación con un JSON válido
UPDATE GlobalConfig 
SET navigationMenu = '[
  {
    "id": "menu-item-home",
    "label": "Inicio",
    "target": "home",
    "openInNewTab": false
  },
  {
    "id": "menu-item-blog",
    "label": "Blog",
    "target": "blog",
    "openInNewTab": false
  },
  {
    "id": "menu-item-portfolio",
    "label": "Portfolio",
    "target": "portfolio",
    "openInNewTab": false
  }
]'
WHERE id = 'global';

-- Verificar la actualización
SELECT id, navigationMenu FROM GlobalConfig WHERE id = 'global';
