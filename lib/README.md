# Neurowitch Core Libraries

<<<<<<< HEAD
Este directorio contiene librerías y utilidades core utilizadas en toda la aplicación Neurowitch.

## Sistema de Traducciones

La aplicación utiliza un sistema centralizado de traducciones para gestionar todos los textos visibles para el usuario, implementando los requisitos del Capítulo 0, sección 0.5 "Application Language":

> **Application Language**: IMPORTANTE: Aunque estas instrucciones de desarrollo están en inglés, la interfaz final de la aplicación (textos UI, etiquetas, mensajes, contenido) DEBE estar en español. Asegúrate de que todo el texto visible implementado en los componentes esté en español.

### Cómo usar las traducciones

Actualmente, se utiliza el objeto `translations` directamente. Nunca escribas texto en español directamente en los componentes.

```tsx
import { translations } from "@/app/translations";

// Traducción simple
const textoGuardar = translations.common.save;

// Traducción con parámetros
const textoBienvenida = translations.admin.welcome.replace("{0}", "Usuario");
```

### Añadir nuevas traducciones

Cuando añadas nuevas funcionalidades que requieran texto en la interfaz:

1. Identifica el grupo apropiado para tu texto (o crea uno nuevo si es necesario)
2. Añade tus traducciones al objeto `translations` en `app/translations.ts`
3. Usa el objeto `translations` en tus componentes

Para documentación detallada, consulta:
=======
This directory contains core libraries and utilities used throughout the Neurowitch application.

## Translation System

The application uses a centralized translation system to manage all user-facing text, implementing the requirements from Chapter 0, section 0.5 "Application Language":

> **Application Language**: IMPORTANT: While these development instructions are in English, the final application's user-facing interface (UI text, labels, messages, content) MUST be in Spanish. Ensure all user-visible text implemented in the components is in Spanish.

### How to Use Translations

All user-facing text should be loaded from the translation system. Never hardcode Spanish text directly in components.

```tsx
import { t } from "@/app/translations";

// Simple translation
const saveText = t("common", "save"); // "Guardar"

// Translation with parameters
const welcomeText = t("admin", "welcome", { params: ["Usuario"] }); // "Bienvenido, Usuario"

// For multiple translations from the same group, create a translator
import { createTranslator } from "@/app/translations";
const tCommon = createTranslator("common");
const saveText = tCommon("save");
const cancelText = tCommon("cancel");
```

### Adding New Translations

When adding new features that require UI text:

1. Identify the appropriate group for your text (or create a new one if needed)
2. Add your translations to the `translations` object in `app/translations.ts`
3. Use the translation functions in your components

For detailed documentation, see:
>>>>>>> feature/modulo4
- [Translation System Documentation (English)](../docs/translation-system.md)
- [Documentación del Sistema de Traducciones (Español)](../docs/sistema-traducciones.md)
