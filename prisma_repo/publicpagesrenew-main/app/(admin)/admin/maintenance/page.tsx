"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Componente principal de la página de mantenimiento
export default function MaintenancePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [migrateStatus, setMigrateStatus] = useState<string | null>(null);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const router = useRouter();

  // Función para mostrar alertas
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  // Verificar el rol del usuario al cargar la página
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const session = await getSession();
        const userRole = session?.user?.role;
        setIsAdmin(userRole === "ADMIN" || userRole === "MASTER");
        setIsMaster(userRole === "MASTER");
        if (!userRole || (userRole !== "ADMIN" && userRole !== "MASTER")) {
          router.push("/admin/dashboard");
          showAlert("error", "No tienes permisos para acceder a esta página");
        }
      } catch (error) {
        console.error("Error al verificar el rol del usuario:", error);
      }
    };

    fetchUserRole();
  }, [router]);

  // Obtener el estado actual del modo de mantenimiento
  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      try {
        const response = await fetch("/api/settings/maintenance-mode");
        if (response.ok) {
          const data = await response.json();
          setMaintenanceMode(data.enabled);
        } else {
          showAlert("error", "No se pudo obtener el estado del modo de mantenimiento");
        }
      } catch (error) {
        console.error("Error al obtener el estado del modo de mantenimiento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceMode();
  }, []);

  // Función para cambiar el estado del modo de mantenimiento
  const toggleMaintenanceMode = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings/maintenance-mode", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !maintenanceMode }),
      });

      if (response.ok) {
        setMaintenanceMode(!maintenanceMode);
        showAlert("success", `Modo de mantenimiento ${!maintenanceMode ? "activado" : "desactivado"}`);
      } else {
        showAlert("error", "No se pudo cambiar el estado del modo de mantenimiento");
      }
    } catch (error) {
      console.error("Error al cambiar el estado del modo de mantenimiento:", error);
      showAlert("error", "Ocurrió un error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar la conexión a la base de datos
  const checkDbConnection = async () => {
    try {
      setDbStatus("Verificando...");
      const response = await fetch("/api/maintenance/db/check");
      if (response.ok) {
        setDbStatus("Conectado");
        showAlert("success", "La conexión a la base de datos funciona correctamente");
      } else {
        const data = await response.json();
        setDbStatus(`Error: ${data.error || "Desconocido"}`);
        showAlert("error", data.error || "No se pudo conectar a la base de datos");
      }
    } catch (error) {
      console.error("Error al verificar la conexión a la base de datos:", error);
      setDbStatus("Error: Fallo en la solicitud");
      showAlert("error", "Ocurrió un error al procesar la solicitud");
    }
  };

  // Función para iniciar el proceso de eliminación de tablas
  const handleDeleteTables = () => {
    setIsDeleteDialogOpen(true);
  };

  // Función para confirmar la eliminación de tablas
  const confirmDeleteTables = () => {
    setIsDeleteDialogOpen(false);
    setIsConfirmDeleteDialogOpen(true);
  };

  // Función para ejecutar la eliminación de tablas
  const executeDeleteTables = async () => {
    if (confirmDeleteText !== "ELIMINAR DATOS") {
      showAlert("error", "El texto de confirmación no coincide");
      return;
    }

    setIsConfirmDeleteDialogOpen(false);
    setConfirmDeleteText("");

    try {
      const response = await fetch("/api/maintenance/db/delete-tables", {
        method: "POST",
      });

      if (response.ok) {
        showAlert("success", "Todas las tablas han sido eliminadas");
      } else {
        const data = await response.json();
        showAlert("error", data.error || "No se pudieron eliminar las tablas");
      }
    } catch (error) {
      console.error("Error al eliminar las tablas:", error);
      showAlert("error", "Ocurrió un error al procesar la solicitud");
    }
  };

  // Función para ejecutar migraciones
  const runMigrations = async () => {
    try {
      setMigrateLoading(true);
      setMigrateStatus("Ejecutando migraciones...");
      const response = await fetch("/api/maintenance/db/migrate", {
        method: "POST",
      });

      if (response.ok) {
        setMigrateStatus("Migraciones aplicadas con éxito");
        showAlert("success", "Las migraciones han sido aplicadas correctamente");
      } else {
        const data = await response.json();
        setMigrateStatus(`Error: ${data.error || "Desconocido"}`);
        showAlert("error", data.error || "No se pudieron aplicar las migraciones");
      }
    } catch (error) {
      console.error("Error al ejecutar migraciones:", error);
      setMigrateStatus("Error: Fallo en la solicitud");
      showAlert("error", "Ocurrió un error al procesar la solicitud");
    } finally {
      setMigrateLoading(false);
    }
  };

  // Función para crear copia de seguridad de la base de datos
  const createBackup = async () => {
    try {
      setBackupLoading(true);
      
      // Abrir en una nueva ventana para descargar el archivo
      window.open("/api/maintenance/db/backup", "_blank");
      
      showAlert("success", "La copia de seguridad se está descargando");
    } catch (error) {
      console.error("Error al crear copia de seguridad:", error);
      showAlert("error", "Ocurrió un error al procesar la solicitud");
    } finally {
      setBackupLoading(false);
    }
  };

  if (!isAdmin && !isMaster) {
    return (
      <div className="p-8">
        <p>Verificando permisos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Mantenimiento de la Aplicación</h1>

      {/* Alerta */}
      {alertMessage && (
        <div className={`mb-4 p-4 rounded-md ${
          alertMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {alertMessage.message}
        </div>
      )}

      {/* Sección 1: Estado de la Aplicación */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Aplicación</CardTitle>
          <CardDescription>Controla si la aplicación está en modo de mantenimiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="text-lg font-medium">Modo &quot;En Construcción&quot;</h3>
              <p className="text-sm text-gray-500">
                Al activar esta opción, los usuarios no podrán acceder al contenido del sitio
              </p>
            </div>
            <Switch 
              checked={maintenanceMode} 
              onCheckedChange={toggleMaintenanceMode}
              disabled={loading} 
              aria-label="Modo 'En Construcción'"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Base de Datos (solo para MASTER) */}
      {isMaster && (
        <Card>
          <CardHeader>
            <CardTitle>Base de Datos</CardTitle>
            <CardDescription>Gestión de la base de datos - Solo usuarios con rol MASTER</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verificar Conexión */}
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Verificar Conexión DB</h3>
                <div className="flex flex-col space-y-2">
                  <Button onClick={checkDbConnection}>Verificar Conexión DB</Button>
                  {dbStatus && (
                    <p className={`mt-2 ${dbStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                      {dbStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Eliminar Tablas */}
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Eliminar Todas las Tablas</h3>
                <div className="flex flex-col space-y-2">
                  <Button variant="destructive" onClick={handleDeleteTables}>
                    Eliminar Todas las Tablas
                  </Button>
                </div>
              </div>

              {/* Ejecutar Migraciones */}
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Aplicar Migraciones Pendientes</h3>
                <div className="flex flex-col space-y-2">
                  <Button onClick={runMigrations} disabled={migrateLoading}>
                    {migrateLoading ? "Ejecutando..." : "Aplicar Migraciones Pendientes"}
                  </Button>
                  {migrateStatus && (
                    <p className={`mt-2 ${migrateStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                      {migrateStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Crear Copia de Seguridad */}
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Crear Copia de Seguridad DB</h3>
                <div className="flex flex-col space-y-2">
                  <Button onClick={createBackup} disabled={backupLoading}>
                    {backupLoading ? "Procesando..." : "Crear Copia de Seguridad DB"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AlertDialog para confirmación inicial */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará TODAS las tablas de la base de datos. Toda la información se perderá permanentemente.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTables}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para confirmación final */}
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              Para confirmar, escribe &quot;ELIMINAR DATOS&quot; en el campo a continuación.
              Una vez confirmado, todos los datos se eliminarán permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              placeholder="Escribe ELIMINAR DATOS para confirmar"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteTables} disabled={confirmDeleteText !== "ELIMINAR DATOS"}>
              Eliminar Tablas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
