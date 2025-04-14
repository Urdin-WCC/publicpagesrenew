# Credenciales y Configuración de Git para Neurowitch

## Repositorio

El proyecto Neurowitch está configurado como un repositorio Git con una copia local y remota.

### Credenciales Configuradas

- **Email**: neurowitch@example.com
- **Nombre**: Neurowitch Developer

### Configuración Aplicada

```bash
git config user.email "neurowitch@example.com"
git config user.name "Neurowitch Developer"
```

### Estado Actual

- Repositorio inicializado: ✅
- Primer commit realizado: ✅
  - Mensaje: "Actualización del sistema de autenticación a Auth.js v5 y reimplementación del rate limiting"
- Repositorio remoto configurado: ✅
  - URL: https://github.com/Urdin-WCC/neurowitch.git

## Comandos Útiles para el Repositorio Remoto

### Clonar el repositorio

Para obtener una copia del repositorio en otro equipo:

```bash
git clone https://github.com/Urdin-WCC/neurowitch.git
```

### Actualizar el repositorio local con cambios remotos

```bash
git pull origin master
```

### Subir nuevos cambios al repositorio remoto

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin master
```

## Notas

- El repositorio contiene toda la implementación del proyecto Neurowitch, incluyendo la actualización del sistema de autenticación a Auth.js v5 y la reimplementación del rate limiting.
- El repositorio remoto en GitHub proporciona una copia de seguridad y facilita la colaboración entre desarrolladores.
- Puedes acceder al repositorio en GitHub en: [https://github.com/Urdin-WCC/neurowitch](https://github.com/Urdin-WCC/neurowitch)
