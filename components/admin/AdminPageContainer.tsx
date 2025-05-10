import React from "react";

// AdminPageContainer: Wrapper visual para páginas del panel de administración.
// Establece márgenes laterales, max-width, padding y fondo opcional.
export default function AdminPageContainer({
  children,
  className = ""
}: {
  children: React.ReactNode,
  className?: string
}) {
  return (
    <div
      className={
        "max-w-4xl mx-auto px-6 py-6 md:px-10 md:py-8 bg-white rounded-lg shadow-sm min-h-[70vh] " +
        className
      }
    >
      {children}
    </div>
  );
}
