# Sistema de Traducciones de Neurowitch

## Descripción General

<<<<<<< HEAD
La aplicación Neurowitch utiliza un sistema centralizado de traducciones para gestionar todos los textos de la interfaz de usuario. Este sistema implementa los requisitos especificados en el Capítulo 0 de la guía del proyecto, particularmente la sección 0.5 "Application Language":

> **Application Language**: IMPORTANTE: Aunque estas instrucciones de desarrollo están en inglés, la interfaz final de la aplicación (textos UI, etiquetas, mensajes, contenido) DEBE estar en español. Asegúrate de que todo el texto visible implementado en los componentes esté en español.

Este enfoque ofrece varias ventajas:
=======
La aplicación Neurowitch utiliza un sistema centralizado de traducciones para gestionar todos los textos de la interfaz de usuario. Este sistema implementa los requisitos especificados en el Capítulo 0 de la guía del proyecto, particularmente la sección 0.5 "Application Language" que establece:

> **Application Language**: IMPORTANT: While these development instructions are in English, the final application's user-facing interface (UI text, labels, messages, content) MUST be in Spanish. Ensure all user-visible text implemented in the components is in Spanish.

Este enfoque ofrece varias ventajas:

>>>>>>> feature/modulo4
1. **Centralización**: Todos los textos están en un solo lugar, facilitando su mantenimiento y actualización.
2. **Consistencia**: Asegura terminología y fraseología consistentes en toda la aplicación, siguiendo el principio de "Consistency" de la sección 0.5.
3. **Preparación para Internacionalización**: Aunque el requisito actual es solo español, el sistema está diseñado para soportar múltiples idiomas en el futuro.
4. **Separación de Responsabilidades**: Separa los textos de la interfaz de la lógica de los componentes, apoyando el principio de "Clean & Commented Code".

## Estructura del Sistema

```
neurowitch-app/
├── app/
<<<<<<< HEAD
│   └── translations.ts    # Contiene todas las traducciones como objeto JS
=======
│   └── translations.ts    # Contiene todas las traducciones y funciones de utilidad
>>>>>>> feature/modulo4
```

## Archivo de Traducciones

Todas las traducciones están almacenadas directamente en el archivo `app/translations.ts` como un objeto JavaScript.

### Estructura de las Traducciones

Las traducciones están organizadas por grupos funcionales:

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "auth": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión"
  }
}
```

### Parámetros Dinámicos

Las traducciones pueden incluir parámetros dinámicos usando la sintaxis `{0}`, `{1}`, etc.:

```json
{
  "admin": {
    "welcome": "Bienvenido, {0}"
  }
}
```

## Uso del Sistema

<<<<<<< HEAD
Actualmente, debes usar el objeto `translations` directamente. No utilices la función `t` ni `createTranslator` (ya no existen).

```tsx
import { translations } from "@/app/translations";

// Traducción simple
const textoGuardar = translations.common.save;

// Traducción con parámetros
const textoBienvenida = translations.admin.welcome.replace("{0}", "Usuario");
=======
### En Cualquier Componente

```tsx
import { t } from "@/app/translations";

export default function MiComponente() {
  // Traducción simple
  const textoGuardar = t("common", "save");

  // Traducción con parámetros
  const textoBienvenida = t("admin", "welcome", { params: ["Usuario"] });

  return (
    <div>
      <button>{textoGuardar}</button>
      <p>{textoBienvenida}</p>
    </div>
  );
}
```

### En Componentes Cliente con Estado

```tsx
"use client";

import { useState } from "react";
import { t, createTranslator } from "@/app/translations";

export default function ComponenteCliente() {
  const [nombre, setNombre] = useState("Usuario");

  // Método 1: Usando la función t
  const textoGuardar = t("common", "save");

  // Método 2: Creando un traductor específico para un grupo
  const tAuth = createTranslator("auth");
  const textoLogin = tAuth("login");

  // Traducción dinámica con estado
  const textoBienvenida = t("admin", "welcome", { params: [nombre] });

  return (
    <div>
      <button>{textoGuardar}</button>
      <p>{textoLogin}</p>
      <p>{textoBienvenida}</p>
    </div>
  );
}
```

## Creación de Traductores Específicos para Grupos

Para componentes que usan muchas traducciones del mismo grupo, puedes crear un traductor específico:

```tsx
import { createTranslator } from "@/app/translations";

// Crear un traductor para el grupo "common"
const tCommon = createTranslator("common");

// Usar el traductor
const textoGuardar = tCommon("save");
const textoCancelar = tCommon("cancel");
const textoCargando = tCommon("loading");

// También puedes usar parámetros
const tAdmin = createTranslator("admin");
const textoBienvenida = tAdmin("welcome", { params: ["Usuario"] });
>>>>>>> feature/modulo4
```

## Añadir Nuevas Traducciones

Al añadir nuevas funcionalidades que requieren texto en la interfaz:

1. Identifica el grupo apropiado para tu texto (o crea uno nuevo si es necesario)
2. Añade tus traducciones al objeto `translations` en `app/translations.ts`
<<<<<<< HEAD
3. Usa el objeto `translations` en tus componentes

## Mejores Prácticas

- **Usa Claves Descriptivas**: Elige claves claras y descriptivas que indiquen el propósito del texto.
- **Organiza por Funcionalidad**: Agrupa las traducciones por funcionalidad o módulo, alineándose con la arquitectura modular descrita en el Capítulo 0.
- **Evita Texto Hardcodeado**: Nunca incluyas texto para el usuario directamente en los componentes. Esto asegura el cumplimiento del requisito "Application Language" que establece que todo el texto visible para el usuario debe estar en español.
- **Documenta el Contexto**: Añade comentarios para traducciones que puedan ser ambiguas, apoyando el principio de "Documentation".
- **Reutiliza Términos Comunes**: Usa el grupo `common` para términos frecuentemente utilizados para mantener la consistencia en toda la aplicación.
- **Mantén las Traducciones Simples**: Evita HTML complejo o formato en las cadenas de traducción para mejorar la mantenibilidad.

## Contenido y Configuración Dinámicos

Todas las páginas públicas deben recibir su contenido, apariencia y configuración dinámicamente desde la base de datos a través de las funciones del Core Module. No debe haber textos ni datos hardcoded en los componentes públicos. Los layouts y componentes principales reciben la configuración y los textos desde la base de datos y el sistema de traducciones.
=======
3. Usa las funciones de traducción en tus componentes

Ejemplo:

```typescript
// En app/translations.ts, añade al objeto translations:
export const translations = {
  // ... traducciones existentes

  "miCaracteristica": {
    "titulo": "Mi Nueva Característica",
    "descripcion": "Esta es una descripción de la nueva característica"
  }

  // ... más traducciones
};
```

```tsx
// En tu componente
import { t } from "@/app/translations";

const titulo = t("miCaracteristica", "titulo");
const descripcion = t("miCaracteristica", "descripcion");
```

## Mejores Prácticas

Siguiendo los principios descritos en el Capítulo 0, sección 0.5 "General Principles & Mandatory Requirements", particularmente "Clean & Commented Code", "Documentation" y "Consistency":

1. **Usa Claves Descriptivas**: Elige claves claras y descriptivas que indiquen el propósito del texto.
2. **Organiza por Funcionalidad**: Agrupa las traducciones por funcionalidad o módulo, alineándose con la arquitectura modular descrita en el Capítulo 0.
3. **Evita Texto Hardcodeado**: Nunca incluyas texto para el usuario directamente en los componentes. Esto asegura el cumplimiento del requisito "Application Language" que establece que todo el texto visible para el usuario debe estar en español.
4. **Documenta el Contexto**: Añade comentarios para traducciones que puedan ser ambiguas, apoyando el principio de "Documentation".
5. **Reutiliza Términos Comunes**: Usa el grupo `common` para términos frecuentemente utilizados para mantener la consistencia en toda la aplicación.
6. **Mantén las Traducciones Simples**: Evita HTML complejo o formato en las cadenas de traducción para mejorar la mantenibilidad.

## Referencia de API

### Funciones Principales

- `t(group: string, key: string, options?: TranslationOptions): string`
  - Obtiene una traducción por grupo y clave
  - Las opciones incluyen `params` para parámetros dinámicos

- `createTranslator(group: string): (key: string, options?: TranslationOptions) => string`
  - Crea una función traductora para un grupo específico

### Interfaz TranslationOptions

```typescript
export interface TranslationOptions {
  /**
   * Parámetros para reemplazar en la cadena de traducción
   * Por ejemplo, si la traducción es "Hola, {0}", y params es ["Mundo"],
   * el resultado será "Hola, Mundo"
   */
  params?: (string | number)[];
}
```
>>>>>>> feature/modulo4

## Ejemplos

Consulta los siguientes archivos para ejemplos de cómo usar el sistema de traducciones:

- `app/page.tsx` - Uso básico en un componente de servidor
- `components/TranslationDemo.tsx` - Uso en un componente cliente con estado
- `app/translation-demo/page.tsx` - Página de demostración mostrando diferentes enfoques

## Internacionalización Futura

Para añadir soporte para un nuevo idioma en el futuro:

1. Crear un nuevo objeto de traducciones en `app/translations.ts`
2. Añadir un mecanismo de selección de idioma
<<<<<<< HEAD
3. Actualizar el código para usar el idioma seleccionado
=======
3. Actualizar las funciones `t` y `createTranslator` para usar el idioma seleccionado

Ejemplo de cómo podría verse:

```typescript
// Soporte para múltiples idiomas (implementación futura)
const translations = {
  es: {
    common: { /* Traducciones en español */ },
    // otros grupos...
  },
  en: {
    common: { /* Traducciones en inglés */ },
    // otros grupos...
  }
};

let currentLanguage = 'es';

export function setLanguage(language: string): void {
  if (translations[language]) {
    currentLanguage = language;
  }
}

export function t(group: string, key: string, options?: TranslationOptions): string {
  const langTranslations = translations[currentLanguage];
  // Resto de la implementación...
}
```
>>>>>>> feature/modulo4
