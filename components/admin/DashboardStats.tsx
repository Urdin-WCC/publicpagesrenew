"use client";

import React from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Fetcher genérico para SWR
 */
const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Componente de estadísticas generales del dashboard.
 * Muestra visitas, gráfico y listas de páginas/referers.
 */
const DashboardStats: React.FC = () => {
  const { data, error, isLoading } = useSWR("/api/stats/summary", fetcher);

  if (isLoading) {
    return <div className="text-gray-500">Cargando estadísticas...</div>;
  }
  if (error) {
    return <div className="text-red-600">Error al cargar estadísticas.</div>;
  }
  if (!data) {
    return <div className="text-gray-500">Sin datos disponibles.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tarjetas de visitas */}
      <div className="space-y-4">
        <div className="bg-blue-100 rounded p-4 shadow">
          <div className="text-lg font-semibold">Visitas últimas 24h</div>
          <div className="text-2xl font-bold">{data.visitas.ultimas_24h}</div>
        </div>
        <div className="bg-green-100 rounded p-4 shadow">
          <div className="text-lg font-semibold">Visitas últimos 7 días</div>
          <div className="text-2xl font-bold">{data.visitas.ultimos_7d}</div>
        </div>
        <div className="bg-yellow-100 rounded p-4 shadow">
          <div className="text-lg font-semibold">Visitas últimos 30 días</div>
          <div className="text-2xl font-bold">{data.visitas.ultimos_30d}</div>
        </div>
      </div>

      {/* Gráfico de visitas diarias */}
      <div className="bg-white rounded p-4 shadow flex flex-col items-center">
        <div className="text-lg font-semibold mb-2">Visitas diarias</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data.visitas_diarias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={v => `Fecha: ${v}`}
              formatter={v => [`${v} visitas`, "Visitas"]}
            />
            <Line
              type="monotone"
              dataKey="visitas"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top páginas */}
      <div className="bg-white rounded p-4 shadow">
        <div className="text-lg font-semibold mb-2">Páginas más visitadas</div>
        <ul className="list-disc pl-5">
          {data.paginas_top.map((p: any, idx: number) => (
            <li key={idx}>
              <span className="font-medium">{p.pagina}</span>: {p.visitas} visitas
            </li>
          ))}
        </ul>
      </div>

      {/* Top referers */}
      <div className="bg-white rounded p-4 shadow">
        <div className="text-lg font-semibold mb-2">Principales referers</div>
        <ul className="list-disc pl-5">
          {data.referers_top.map((r: any, idx: number) => (
            <li key={idx}>
              <span className="font-medium">{r.referer}</span>: {r.visitas} visitas
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardStats;