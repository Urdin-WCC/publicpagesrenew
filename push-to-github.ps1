# Script para hacer una copia de seguridad completa del proyecto en un repositorio GitHub
# Ejecutar desde PowerShell: .\push-to-github.ps1

# Configuración del repositorio
$REPO_URL = "https://github.com/Urdin-WCC/publicpagesrenew.git"
$BRANCH_NAME = "main"
$COMMIT_MESSAGE = "Backup completo antes de implementar cambios en la interfaz pública"

# Función para imprimir mensajes con colores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Función para ejecutar comandos con manejo de errores
function Exec-Command {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [switch]$SuppressOutput
    )
    
    try {
        if ($SuppressOutput) {
            Invoke-Expression $Command -ErrorAction Stop | Out-Null
        }
        else {
            Invoke-Expression $Command -ErrorAction Stop
        }
        return $true
    }
    catch {
        if (-not $SuppressOutput) {
            Write-ColorOutput "Red" "Error ejecutando: $Command"
            Write-ColorOutput "Red" $_.Exception.Message
        }
        return $false
    }
}

# Función principal
function Main {
    Write-ColorOutput "Green" "`n🚀 Iniciando copia de seguridad a GitHub..."
    
    # 1. Verificar si ya existe un repositorio Git
    $isGitRepo = Test-Path -Path ".git" -PathType Container
    
    if (-not $isGitRepo) {
        Write-ColorOutput "Blue" "`n📦 Inicializando repositorio Git..."
        if (-not (Exec-Command "git init")) {
            Write-ColorOutput "Red" "❌ Error al inicializar repositorio Git. Abortando."
            exit 1
        }
    }
    else {
        Write-ColorOutput "Green" "✅ Repositorio Git ya existe."
    }
    
    # 2. Verificar estado actual
    Write-ColorOutput "Blue" "`n🔍 Verificando estado actual del repositorio..."
    Exec-Command "git status"
    
    # 3. Añadir todos los archivos al staging
    Write-ColorOutput "Blue" "`n📋 Añadiendo archivos al staging..."
    if (-not (Exec-Command "git add .")) {
        Write-ColorOutput "Red" "❌ Error al añadir archivos. Abortando."
        exit 1
    }
    
    # 4. Crear commit
    Write-ColorOutput "Blue" "`n💾 Creando commit..."
    if (-not (Exec-Command "git commit -m '$COMMIT_MESSAGE'")) {
        Write-ColorOutput "Yellow" "⚠️ No se pudo crear el commit, posiblemente no hay cambios o hay problemas con la configuración de Git."
        # Continuamos de todos modos, ya que podría ser solo que no hay cambios nuevos
    }
    
    # 5. Configurar repositorio remoto
    Write-ColorOutput "Blue" "`n🔗 Configurando repositorio remoto..."
    
    # Verificar si ya existe el remoto "origin"
    try {
        $remotes = Invoke-Expression "git remote"
        
        if ($remotes -match "origin") {
            # Actualizar URL del remoto existente
            Write-ColorOutput "Blue" "Actualizando URL del remoto 'origin'..."
            if (-not (Exec-Command "git remote set-url origin $REPO_URL")) {
                Write-ColorOutput "Red" "❌ Error al actualizar URL del remoto. Abortando."
                exit 1
            }
        }
        else {
            # Agregar nuevo remoto
            Write-ColorOutput "Blue" "Agregando nuevo remoto 'origin'..."
            if (-not (Exec-Command "git remote add origin $REPO_URL")) {
                Write-ColorOutput "Red" "❌ Error al añadir remoto. Abortando."
                exit 1
            }
        }
    }
    catch {
        Write-ColorOutput "Red" "Error verificando remotos:"
        Write-ColorOutput "Red" $_.Exception.Message
        exit 1
    }
    
    # 6. Subir cambios al repositorio remoto
    Write-ColorOutput "Blue" "`n☁️ Subiendo cambios a GitHub..."
    if (-not (Exec-Command "git push -u origin $BRANCH_NAME")) {
        Write-ColorOutput "Yellow" "`n⚠️ Error al subir cambios. Intentando forzar el push..."
        
        if (-not (Exec-Command "git push -u origin $BRANCH_NAME --force")) {
            Write-ColorOutput "Red" "❌ Error al forzar el push. Revisa credenciales o permisos."
            
            # Sugerir comandos manuales
            Write-ColorOutput "Cyan" "`n🔧 Puedes intentar manualmente:"
            Write-Output "git push -u origin $BRANCH_NAME --force"
            
            exit 1
        }
    }
    
    Write-ColorOutput "Green" "`n✅ Copia de seguridad completada con éxito!"
    Write-ColorOutput "Cyan" "Repositorio: $REPO_URL"
    Write-ColorOutput "Cyan" "Rama: $BRANCH_NAME"
    Write-ColorOutput "Green" "`n🚀 Ahora puedes proceder con la implementación de los cambios en la interfaz pública."
}

# Ejecutar la función principal
Main
