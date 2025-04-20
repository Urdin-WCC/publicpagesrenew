#!/bin/bash

# Script para subir el proyecto a GitHub
# Basado en los cambios realizados por el módulo de configuración de apariencia

# Colores para mejor visualización
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparando para subir el proyecto a GitHub...${NC}"

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git no está instalado. Por favor, instala Git primero.${NC}"
    exit 1
fi

# Verificar si ya existe un repositorio Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Inicializando repositorio Git...${NC}"
    git init
    
    # Verificar que se creó correctamente
    if [ ! -d ".git" ]; then
        echo -e "${RED}Error al inicializar repositorio Git.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Repositorio Git inicializado correctamente.${NC}"
else
    echo -e "${GREEN}Repositorio Git ya existe, continuando...${NC}"
fi

# Crear o actualizar .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}Creando archivo .gitignore básico...${NC}"
    cat > .gitignore << EOF
# Dependencias
/node_modules

# Directorios de build
/.next/
/out/
/build

# Archivos de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Configuración de los editores
.DS_Store
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Archivos de sistema
Thumbs.db
.DS_Store

# Archivos de imagen subidos
/public/uploads/images/*
!/public/uploads/images/.gitkeep
EOF
    # Crear el directorio de imágenes si no existe
    mkdir -p public/uploads/images
    touch public/uploads/images/.gitkeep
    echo -e "${GREEN}Archivo .gitignore creado correctamente.${NC}"
else
    echo -e "${GREEN}Archivo .gitignore ya existe, asegúrate de que excluye node_modules y archivos de sistema.${NC}"
fi

# Comprobar si hay cambios para añadir
if git status --porcelain | grep -q .; then
    echo -e "${YELLOW}Añadiendo archivos al repositorio...${NC}"
    git add .
    
    echo -e "${YELLOW}Realizando commit de los cambios...${NC}"
    git commit -m "Mejoras en módulo de configuración de apariencia: fix en SelectItem, soporte para GIF/WebP, robustez en base de datos"
    
    echo -e "${GREEN}Commit realizado correctamente.${NC}"
else
    echo -e "${YELLOW}No hay cambios que commitear.${NC}"
fi

# Comprobar si existe un remote
if git remote -v | grep -q origin; then
    echo -e "${YELLOW}Subiendo cambios a GitHub...${NC}"
    git push origin
    echo -e "${GREEN}Proyecto subido a GitHub correctamente.${NC}"
else
    echo -e "${YELLOW}No se ha configurado un remote 'origin'. Para subir a GitHub:${NC}"
    echo -e "1. Crea un repositorio en GitHub: https://github.com/new"
    echo -e "2. Configura el remote con: ${GREEN}git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git${NC}"
    echo -e "3. Sube los cambios con: ${GREEN}git push -u origin main${NC} (o ${GREEN}git push -u origin master${NC} según tu configuración)"
fi

echo -e "${GREEN}¡Proceso completado! Revisa los mensajes anteriores para confirmar el estado.${NC}"
