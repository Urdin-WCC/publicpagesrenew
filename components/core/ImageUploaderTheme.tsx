import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * Props para ImageUploaderTheme
 */
interface ImageUploaderThemeProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  themeId?: string | number; // ID del tema
  imageType?: "main" | "card"; // Tipo de imagen: main o card
}

/**
 * Componente especializado para subir imágenes de fondo para temas.
 * Guarda las imágenes con extensión universal .img:
 * - /images/backgrounds/main-{themeId}.img (para fondos generales)
 * - /images/backgrounds/card-{themeId}.img (para fondos de tarjetas)
 */
export const ImageUploaderTheme: React.FC<ImageUploaderThemeProps> = ({
  value,
  onChange,
  label = "Selecciona o arrastra una imagen para el fondo",
  themeId,
  imageType = "main",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Si no tenemos themeId, no podemos guardar la imagen correctamente
  const noThemeId = !themeId || themeId === "undefined" || themeId === "null" || themeId === "";

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || noThemeId) return;
    
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    formData.append("targetType", "theme"); // Especificar que es para un tema
    formData.append("themeId", String(themeId));
    formData.append("imageType", imageType);
    
    const res = await fetch("/api/upload-image/special", {
      method: "POST",
      body: formData,
    });
    
    if (res.ok) {
      const data = await res.json();
      onChange(data.url); // La URL será /images/backgrounds/{imageType}-{themeId}.img
    } else {
      alert(`Error al subir la imagen de fondo ${imageType}`);
    }
  }, [onChange, themeId, imageType, noThemeId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "image/*": [],
      "image/gif": [],
      "image/webp": []
    },
    multiple: false,
    disabled: noThemeId, // Deshabilitar si no hay ID de tema
  });

  // Abrir modal y cargar imágenes existentes
  const openModal = async () => {
    if (noThemeId) {
      alert("Es necesario guardar el tema primero para poder asignar imágenes.");
      return;
    }
    
    setShowModal(true);
    setLoading(true);
    const res = await fetch("/api/list-images");
    if (res.ok) {
      const data = await res.json();
      setExistingImages(data.images || []);
    }
    setLoading(false);
  };

  // Cuando se selecciona una imagen existente
  const selectExistingImage = async (imageUrl: string) => {
    try {
      if (noThemeId) return;
      
      // Especificar que queremos copiar esta imagen para el tema
      const res = await fetch("/api/copy-image-for-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sourceUrl: imageUrl,
          themeId: themeId,
          imageType: imageType
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        onChange(data.url); // La URL será /images/backgrounds/{imageType}-{themeId}.img
        setShowModal(false);
      } else {
        alert(`Error al establecer imagen de fondo ${imageType}`);
      }
    } catch (error) {
      console.error(`Error copying image for theme (${imageType}):`, error);
      alert(`Error al establecer imagen de fondo ${imageType}`);
    }
  };

  const expectedFilename = noThemeId 
    ? "Guarde el tema primero" 
    : `/images/backgrounds/${imageType}-${themeId}.img`;

  return (
    <div className="mb-4">
      {label && <label className="block mb-2 font-medium">{label}</label>}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${noThemeId ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={label}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta la imagen aquí...</p>
        ) : (
          <div>
            {value ? (
              <div className="mb-2">
                <img 
                  src={
                    value
                      ? value.replace(/\.[a-zA-Z0-9]+$/, '.img') + `?t=${Date.now()}`
                      : ''
                  }
                  alt={`Fondo de ${imageType} seleccionado`} 
                  className="mx-auto max-h-32 mb-2" 
                />
                <p className="text-sm text-gray-500">
                  La imagen se guardará como {expectedFilename} (con extensión universal)
                </p>
              </div>
            ) : (
              <p>
                {noThemeId 
                  ? "Guarde el tema primero para poder asignar imágenes"
                  : "Arrastra una imagen o haz clic para seleccionar"}
                {!noThemeId && (
                  <span className="block text-xs text-blue-600 mt-1">
                    Se guardará como {expectedFilename} (con extensión universal)
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`mt-2 px-4 py-1 bg-gray-200 rounded font-semibold ${noThemeId ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={openModal}
        disabled={noThemeId}
      >
        Seleccionar de las existentes
      </button>
      
      {/* Modal de selección de imágenes */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
            <div className="absolute top-2 right-2">
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <h2 className="text-lg font-bold mb-4">Selecciona una imagen existente</h2>
            <p className="text-sm text-blue-600 mb-4">
              La imagen seleccionada se copiará como {expectedFilename} (con extensión universal)
            </p>
            {loading ? (
              <p>Cargando imágenes...</p>
            ) : existingImages.length === 0 ? (
              <p>No hay imágenes subidas.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-72 overflow-y-auto">
                {existingImages.map((img) => (
                  <div key={img} className="relative">
                    <img
                      src={img}
                      alt="Imagen existente"
                      style={{ height: "80px", width: "100%", objectFit: "cover" }}
                      className={`cursor-pointer border-2 rounded shadow-sm transition ${
                        value === img ? "border-blue-500" : "border-gray-200"
                      }`}
                      onClick={() => selectExistingImage(img)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderTheme;
