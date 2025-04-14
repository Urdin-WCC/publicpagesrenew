# Neurowitch Translation System Documentation

## Overview

<<<<<<< HEAD
The Neurowitch application uses a centralized translation system to manage all user-facing text. This system implements the requirements specified in Chapter 0 of the project guide, particularly section 0.5 "Application Language":
=======
The Neurowitch application uses a centralized translation system to manage all user-facing text. This system implements the requirements specified in Chapter 0 of the project guide, particularly section 0.5 "Application Language" which states:
>>>>>>> feature/modulo4

> **Application Language**: IMPORTANT: While these development instructions are in English, the final application's user-facing interface (UI text, labels, messages, content) MUST be in Spanish. Ensure all user-visible text implemented in the components is in Spanish.

This approach offers several benefits:
<<<<<<< HEAD
=======

>>>>>>> feature/modulo4
1. **Centralization**: All text strings are stored in a single location, making them easy to maintain and update.
2. **Consistency**: Ensures consistent terminology and phrasing throughout the application, following the "Consistency" principle from section 0.5.
3. **Future Internationalization**: Although the current requirement is Spanish-only, the system is designed to easily support multiple languages in the future.
4. **Separation of Concerns**: Separates UI text from component logic, supporting the "Clean & Commented Code" principle.

## File Structure

```
neurowitch-app/
├── app/
<<<<<<< HEAD
│   └── translations.ts    # Contains all translations as a JS object
=======
│   └── translations.ts    # Contains all translations and utility functions
>>>>>>> feature/modulo4
```

## Translation File

All translations are stored directly in the `app/translations.ts` file as a JavaScript object.

### Structure of Translation Files

Translations are organized by functional groups:

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

### Dynamic Parameters

Translations can include dynamic parameters using the `{0}`, `{1}`, etc. syntax:

```json
{
  "admin": {
    "welcome": "Bienvenido, {0}"
  }
}
```

## Using Translations

<<<<<<< HEAD
Currently, you should use the `translations` object directly. Do not use the function `t` or `createTranslator` (they no longer exist).

```tsx
import { translations } from "@/app/translations";

// Simple translation
const saveText = translations.common.save;

// Translation with parameters
const welcomeText = translations.admin.welcome.replace("{0}", "Usuario");
=======
### In Any Component

```tsx
import { t } from "@/app/translations";

export default function MyComponent() {
  // Simple translation
  const saveText = t("common", "save");

  // Translation with parameters
  const welcomeText = t("admin", "welcome", { params: ["Usuario"] });

  return (
    <div>
      <button>{saveText}</button>
      <p>{welcomeText}</p>
    </div>
  );
}
```

### In Client Components with State

```tsx
"use client";

import { useState } from "react";
import { t, createTranslator } from "@/app/translations";

export default function ClientComponent() {
  const [name, setName] = useState("Usuario");

  // Method 1: Using the t function
  const saveText = t("common", "save");

  // Method 2: Creating a group-specific translator
  const tAuth = createTranslator("auth");
  const loginText = tAuth("login");

  // Dynamic translation with state
  const welcomeText = t("admin", "welcome", { params: [name] });

  return (
    <div>
      <button>{saveText}</button>
      <p>{loginText}</p>
      <p>{welcomeText}</p>
    </div>
  );
}
```

## Creating Group-Specific Translators

For components that use many translations from the same group, you can create a group-specific translator:

```tsx
import { createTranslator } from "@/app/translations";

// Create a translator for the common group
const tCommon = createTranslator("common");

// Use the translator
const saveText = tCommon("save");
const cancelText = tCommon("cancel");
const loadingText = tCommon("loading");

// You can also use parameters
const tAdmin = createTranslator("admin");
const welcomeText = tAdmin("welcome", { params: ["Usuario"] });
>>>>>>> feature/modulo4
```

## Adding New Translations

When adding new features that require UI text:

1. Identify the appropriate group for your text (or create a new one if needed)
2. Add your translations to the `translations` object in `app/translations.ts`
<<<<<<< HEAD
3. Use the `translations` object in your components

## Best Practices

- **Use Descriptive Keys**: Choose clear, descriptive keys that indicate the purpose of the text.
- **Organize by Feature**: Group translations by feature or module, aligning with the modular architecture described in Chapter 0.
- **Avoid Hardcoded Text**: Never hardcode user-facing text in components. This ensures compliance with the "Application Language" requirement that all user-visible text must be in Spanish.
- **Document Context**: Add comments for translations that might be ambiguous, supporting the "Documentation" principle.
- **Reuse Common Terms**: Use the `common` group for frequently used terms to maintain consistency across the application.
- **Keep Translations Simple**: Avoid complex HTML or formatting in translation strings to improve maintainability.

## Dynamic Content and Configuration

All public pages must receive their content, appearance, and configuration dynamically from the database via Core Module functions. There must be no hardcoded text or data in public components. Layouts and main components receive configuration and texts from the database and the translation system.
=======
3. Use the translation functions in your components

Example:

```typescript
// In app/translations.ts, add to the translations object:
export const translations = {
  // ... existing translations

  "myFeature": {
    "title": "Mi Nueva Característica",
    "description": "Esta es una descripción de la nueva característica"
  }

  // ... more translations
};
```

```tsx
// In your component
import { t } from "@/app/translations";

const title = t("myFeature", "title");
const description = t("myFeature", "description");
```

## Best Practices

Following the principles outlined in Chapter 0, section 0.5 "General Principles & Mandatory Requirements", particularly "Clean & Commented Code", "Documentation", and "Consistency":

1. **Use Descriptive Keys**: Choose clear, descriptive keys that indicate the purpose of the text.
2. **Organize by Feature**: Group translations by feature or module, aligning with the modular architecture described in Chapter 0.
3. **Avoid Hardcoded Text**: Never hardcode user-facing text in components. This ensures compliance with the "Application Language" requirement that all user-visible text must be in Spanish.
4. **Document Context**: Add comments for translations that might be ambiguous, supporting the "Documentation" principle.
5. **Reuse Common Terms**: Use the `common` group for frequently used terms to maintain consistency across the application.
6. **Keep Translations Simple**: Avoid complex HTML or formatting in translation strings to improve maintainability.

## API Reference

### Core Functions

- `t(group: string, key: string, options?: TranslationOptions): string`
  - Gets a translation by group and key
  - Options include `params` for dynamic parameters

- `createTranslator(group: string): (key: string, options?: TranslationOptions) => string`
  - Creates a translator function for a specific group

### TranslationOptions Interface

```typescript
export interface TranslationOptions {
  /**
   * Parameters to replace in the translation string
   * For example, if the translation is "Hello, {0}", and params is ["World"],
   * the result will be "Hello, World"
   */
  params?: (string | number)[];
}
```
>>>>>>> feature/modulo4

## Examples

See the following files for examples of how to use the translation system:

- `app/page.tsx` - Basic usage in a server component
- `components/TranslationDemo.tsx` - Usage in a client component with state
- `app/translation-demo/page.tsx` - Demo page showing different approaches

## Future Internationalization

To add support for a new language in the future:

1. Create a new translations object in `app/translations.ts`
2. Add a language selection mechanism
<<<<<<< HEAD
3. Update the code to use the selected language
=======
3. Update the `t` and `createTranslator` functions to use the selected language

Example of how this might look:

```typescript
// Multiple language support (future implementation)
const translations = {
  es: {
    common: { /* Spanish translations */ },
    // other groups...
  },
  en: {
    common: { /* English translations */ },
    // other groups...
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
  // Rest of implementation...
}
```
>>>>>>> feature/modulo4
