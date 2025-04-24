#!/bin/bash
# Script para hacer una copia de seguridad completa del proyecto en un repositorio GitHub
# Ejecutar desde Bash: bash push-to-github.sh

# Configuración del repositorio
REPO_URL="https://github.com/Urdin-WCC/publicpagesrenew.git"
BRANCH_NAME="main"
COMMIT_MESSAGE="Backup completo antes de implementar cambios en la interfaz pública"

# Colores para la consola
RESET="\033[0m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"

# Función para imprimir mensajes con colores
log() {
  COLOR=$1
  shift
  echo -e "${COLOR}$@${RESET}"
}

# Función para ejecutar comandos con manejo de errores
exec_command() {
  COMMAND=$1
  SUPPRESS_OUTPUT=$2

  if [ "$SUPPRESS_OUTPUT" = "true" ]; then
    eval "$COMMAND" > /dev/null 2>&1
  else
    eval "$COMMAND"
  fi

  if [ $? -ne 0 ]; then
    if [ "$SUPPRESS_OUTPUT" != "true" ]; then
      log $RED "Error ejecutando: $COMMAND"
    fi
    return 1
  fi

  return 0
}

# Función principal
main() {
  log $GREEN "\n🚀 Iniciando copia de seguridad a GitHub..."
  
  # 1. Verificar si ya existe un repositorio Git
  if [ -d ".git" ]; then
    log $GREEN "✅ Repositorio Git ya existe."
  else
    log $BLUE "\n📦 Inicializando repositorio Git..."
    if ! exec_command "git init"; then
      log $RED "❌ Error al inicializar repositorio Git. Abortando."
      exit 1
    fi
  fi
  
  # 2. Verificar estado actual
  log $BLUE "\n🔍 Verificando estado actual del repositorio..."
  exec_command "git status"
  
  # 3. Añadir todos los archivos al staging
  log $BLUE "\n📋 Añadiendo archivos al staging..."
  
  # Asegurarse de que .gitignore existe con configuraciones correctas
  if [ ! -f ".gitignore" ]; then
    log $YELLOW "Creando .gitignore completo..."
    cat > .gitignore << EOL
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOL
  else
    # Verificar que node_modules esté en .gitignore
    if ! grep -q "node_modules" .gitignore; then
      log $YELLOW "Añadiendo node_modules a .gitignore..."
      echo -e "\n# Dependencies\nnode_modules/\n" >> .gitignore
    fi
  fi

  log $BLUE "🔍 Verificando que node_modules esté correctamente ignorado..."

  # Añadir archivos no rastreados, pero respetando .gitignore
  log $BLUE "Añadiendo todos los archivos no rastreados (excepto los ignorados en .gitignore)..."
  
  # Primero obtener una lista de todos los archivos no rastreados
  log $BLUE "Archivos no rastreados:"
  git ls-files --others --exclude-standard
  
  # Añadir todos los archivos, respetando .gitignore
  if ! exec_command "git add --all --verbose"; then
    log $RED "❌ Error al añadir archivos. Abortando."
    exit 1
  fi

  # Verificar que node_modules NO esté siendo rastreado
  log $BLUE "🔍 Verificando que node_modules NO esté incluido..."
  STAGED_FILES=$(git ls-files --stage)
  if echo "$STAGED_FILES" | grep -q "node_modules/"; then
    log $YELLOW "⚠️ ¡ADVERTENCIA! node_modules está siendo rastreado. Corrigiendo..."
    # Intentar eliminar node_modules del staging
    exec_command "git rm -r --cached node_modules/"
  else
    log $GREEN "✅ node_modules está correctamente ignorado."
  fi
  
  log $GREEN "✅ Todos los archivos añadidos correctamente."
  
  # 4. Crear commit
  log $BLUE "\n💾 Creando commit..."
  if ! exec_command "git commit -m \"$COMMIT_MESSAGE\""; then
    log $YELLOW "⚠️ No se pudo crear el commit, posiblemente no hay cambios o hay problemas con la configuración de Git."
    # Continuamos de todos modos, ya que podría ser solo que no hay cambios nuevos
  fi
  
  # 5. Configurar repositorio remoto
  log $BLUE "\n🔗 Configurando repositorio remoto..."
  
  # Verificar si ya existe el remoto "origin"
  REMOTES=$(git remote)
  
  if echo "$REMOTES" | grep -q "origin"; then
    # Actualizar URL del remoto existente
    log $BLUE "Actualizando URL del remoto 'origin'..."
    if ! exec_command "git remote set-url origin $REPO_URL"; then
      log $RED "❌ Error al actualizar URL del remoto. Abortando."
      exit 1
    fi
  else
    # Agregar nuevo remoto
    log $BLUE "Agregando nuevo remoto 'origin'..."
    if ! exec_command "git remote add origin $REPO_URL"; then
      log $RED "❌ Error al añadir remoto. Abortando."
      exit 1
    fi
  fi
  
  # 6. Subir cambios al repositorio remoto
  log $BLUE "\n☁️ Subiendo cambios a GitHub..."
  if ! exec_command "git push -u origin $BRANCH_NAME"; then
    log $YELLOW "\n⚠️ Error al subir cambios. Intentando forzar el push..."
    
    if ! exec_command "git push -u origin $BRANCH_NAME --force"; then
      log $RED "❌ Error al forzar el push. Revisa credenciales o permisos."
      
      # Sugerir comandos manuales
      log $CYAN "\n🔧 Puedes intentar manualmente:"
      echo "git push -u origin $BRANCH_NAME --force"
      
      exit 1
    fi
  fi
  
  log $GREEN "\n✅ Copia de seguridad completada con éxito!"
  log $CYAN "Repositorio: $REPO_URL"
  log $CYAN "Rama: $BRANCH_NAME"
  log $GREEN "\n🚀 Ahora puedes proceder con la implementación de los cambios en la interfaz pública."
}

# Ejecutar la función principal
main
