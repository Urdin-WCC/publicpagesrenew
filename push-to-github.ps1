# Script para subir el proyecto a GitHub en Windows
# Basado en los cambios realizados por el módulo de configuración de apariencia

# Función para mostrar mensajes con colores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Yellow "Preparando para subir el proyecto a GitHub..."

# Verificar si Git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "Git no está instalado. Por favor, instala Git primero."
    exit 1
}

# Verificar si ya existe un repositorio Git
if (-not (Test-Path ".git")) {
    Write-ColorOutput Yellow "Inicializando repositorio Git..."
    git init
    
    # Verificar que se creó correctamente
    if (-not (Test-Path ".git")) {
        Write-ColorOutput Red "Error al inicializar repositorio Git."
        exit 1
    }
    
    Write-ColorOutput Green "Repositorio Git inicializado correctamente."
}
else {
    Write-ColorOutput Green "Repositorio Git ya existe, continuando..."
}

# Crear o actualizar .gitignore si no existe
if (-not (Test-Path ".gitignore")) {
    Write-ColorOutput Yellow "Creando archivo .gitignore básico..."
    @"
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
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
    
    # Crear el directorio de imágenes si no existe
    if (-not (Test-Path "public/uploads/images")) {
        New-Item -Path "public/uploads/images" -ItemType Directory -Force | Out-Null
    }
    New-Item -Path "public/uploads/images/.gitkeep" -ItemType File -Force | Out-Null
    Write-ColorOutput Green "Archivo .gitignore creado correctamente."
}
else {
    Write-ColorOutput Green "Archivo .gitignore ya existe, asegúrate de que excluye node_modules y archivos de sistema."
}

# Comprobar si hay cambios para añadir
$status = git status --porcelain
if ($status) {
    Write-ColorOutput Yellow "Añadiendo archivos al repositorio..."
    git add .
    
    Write-ColorOutput Yellow "Realizando commit de los cambios..."
    git commit -m "Mejoras en módulo de configuración de apariencia: fix en SelectItem, soporte para GIF/WebP, robustez en base de datos"
    
    Write-ColorOutput Green "Commit realizado correctamente."
}
else {
    Write-ColorOutput Yellow "No hay cambios que commitear."
}

# Comprobar si existe un remote
$remote = git remote -v
if ($remote -match "origin") {
    Write-ColorOutput Yellow "Subiendo cambios a GitHub..."
    git push origin
    Write-ColorOutput Green "Proyecto subido a GitHub correctamente."
}
else {
    Write-ColorOutput Yellow "No se ha configurado un remote 'origin'. Para subir a GitHub:"
    Write-Host "1. Crea un repositorio en GitHub: https://github.com/new"
    Write-Host "2. Configura el remote con:" -NoNewline
    Write-ColorOutput Green " git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git"
    Write-Host "3. Sube los cambios con:" -NoNewline
    Write-ColorOutput Green " git push -u origin main"
    Write-Host "   (o " -NoNewline
    Write-ColorOutput Green "git push -u origin master" -NoNewline
    Write-Host " según tu configuración)"
}

Write-ColorOutput Green "¡Proceso completado! Revisa los mensajes anteriores para confirmar el estado."
