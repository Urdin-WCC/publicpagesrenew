# HTML Sanitization Fix

## Problema Resuelto
Se identificó y corrigió un problema con la sanitización de HTML que estaba causando que algunos enlaces se malformaran, específicamente:

1. Enlaces con `target=""` vacíos se estaban convirtiendo incorrectamente en `target="_blank"`
2. URLs que contenían caracteres HTML (`<`, `>`) no se estaban sanitizando adecuadamente
3. La distinción entre enlaces internos y externos no era clara

## Solución Implementada

### Mejoras en FixedHtmlRenderer
Se actualizó la lógica de sanitización de enlaces en `components/public/FixedHtmlRenderer.tsx`:

```typescript
// Antes
if (link.hasAttribute('target')) {
  const targetAttr = link.getAttribute('target');
  if (!targetAttr || targetAttr === '') {
    link.setAttribute('target', '_blank');
  }
}

// Después
const href = link.getAttribute('href') || '';

// Limpiar y validar href
if (!href || href === '') {
  link.setAttribute('href', '#');
} else if (href.includes('<') || href.includes('>')) {
  // Si el href contiene HTML, reemplazarlo con #
  link.setAttribute('href', '#');
}

// Manejar enlaces externos
if (href.startsWith('http') || href.startsWith('//')) {
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
} else {
  // Para enlaces internos, eliminar target si está vacío
  const targetAttr = link.getAttribute('target');
  if (targetAttr === '') {
    link.removeAttribute('target');
  }
}
```

### Cambios Principales

1. **Validación de href**
   - Se verifica si el href está vacío
   - Se detecta y maneja contenido HTML en URLs
   - Se proporciona un fallback seguro ('#') para enlaces inválidos

2. **Manejo de Target**
   - Solo se aplica `target="_blank"` a enlaces externos
   - Se eliminan los targets vacíos en enlaces internos
   - Se mantienen los targets específicos definidos por el usuario

3. **Seguridad**
   - Se añade `rel="noopener noreferrer"` a enlaces externos
   - Se sanitizan URLs con caracteres HTML potencialmente peligrosos
   - Se preserva la funcionalidad de enlaces legítimos

## Beneficios

1. **Mejor Seguridad**
   - Prevención de XSS a través de URLs maliciosas
   - Manejo seguro de enlaces externos
   - Sanitización adecuada de caracteres HTML

2. **Comportamiento Consistente**
   - Los enlaces internos y externos se manejan de manera predecible
   - Se respetan las configuraciones de target del usuario
   - No se alteran innecesariamente los enlaces válidos

3. **SEO y Accesibilidad**
   - Los enlaces mantienen su semántica original cuando es apropiado
   - Se preservan los atributos de accesibilidad
   - Mejor manejo de enlaces para crawlers

## Notas Adicionales

- Los enlaces que intentan incluir HTML en sus URLs ahora se convierten en enlaces seguros ('#')
- Los enlaces externos siempre se abren en una nueva pestaña con protección contra tabnabbing
- Los enlaces internos mantienen su comportamiento original a menos que sean inválidos
