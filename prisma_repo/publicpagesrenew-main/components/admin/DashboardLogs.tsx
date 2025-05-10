"use client";

import React, { useState } from "react";
import useSWR from "swr";

/**
 * Fetcher genérico para SWR
 */
const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Componente de logs administrativos del dashboard.
 * Muestra tabla paginada y botones de exportar/reiniciar.
 */
const DashboardLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(`/api/stats/admin-logs?page=${page}`, fetcher);

  if (isLoading) {
    return <div className="text-gray-500">Cargando registros...</div>;
  }
  if (error) {
    return <div className="text-red-600">Error al cargar registros.</div>;
  }
  if (!data) {
    return <div className="text-gray-500">Sin datos disponibles.</div>;
  }

  const { logs, totalPages } = data;

  // Handlers para los botones (placeholders)
  const handleExport = () => {
    alert("Funcionalidad de exportar a CSV próximamente.");
  };
  const handleReset = () => {
    if (confirm("¿Seguro que deseas reiniciar las estadísticas? Esta acción no se puede deshacer.")) {
      alert("Funcionalidad de reinicio próximamente.");
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleExport}
        >
          Exportar Logs a CSV
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={handleReset}
        >
          Reiniciar Estadísticas
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Usuario</th>
              <th className="px-4 py-2 border-b">Acción</th>
              <th className="px-4 py-2 border-b">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id}>
                <td className="px-4 py-2 border-b">{log.id}</td>
                <td className="px-4 py-2 border-b">{log.usuario}</td>
                <td className="px-4 py-2 border-b">{log.accion}</td>
                <td className="px-4 py-2 border-b">{log.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Controles de paginación */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default DashboardLogs;