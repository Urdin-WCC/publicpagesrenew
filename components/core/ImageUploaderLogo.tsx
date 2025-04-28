import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * Props para ImageUploaderLogo
 */
interface ImageUploaderLogoProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Componente especializado para subir el logo del sitio.
 * Guarda la imagen con la extensión universal .img:
 * - /images/logo.img
 */
export const ImageUploaderLogo: React.FC<ImageUploaderLogoProps> = ({
  value,
  onChange,
  label = "Selecciona o arrastra una imagen para el logo",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    formData.append("targetType", "logo"); // Especificar que es un logo
    
    const res = await fetch("/api/upload-image/special", {
      method: "POST",
      body: formData,
    });
    
    if (res.ok) {
      const data = await res.json();
      onChange(data.url); // La URL será /images/logo.img (con extensión universal)
    } else {
      alert("Error al subir el logo");
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "image/*": [],
      "image/gif": [],
      "image/webp": []
    },
    multiple: false,
  });

  // Abrir modal y cargar imágenes existentes
  const openModal = async () => {
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
      // Especificar que queremos copiar esta imagen como logo
      const res = await fetch("/api/copy-image-as-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceUrl: imageUrl }),
      });
      
      if (res.ok) {
        const data = await res.json();
        onChange(data.url); // La URL será /images/logo.img (con extensión universal)
        setShowModal(false);
      } else {
        alert("Error al establecer el logo");
      }
    } catch (error) {
      console.error("Error copying image as logo:", error);
      alert("Error al establecer el logo");
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="block mb-2 font-medium">{label}</label>}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
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
                  src={value + `?t=${Date.now()}`} // Añadir timestamp para forzar refresco
                  alt="Logo seleccionado" 
                  className="mx-auto max-h-32 mb-2" 
                />
              <p className="text-sm text-gray-500">
                El logo se guardará como /images/logo.img (con extensión universal)
              </p>
              </div>
            ) : (
              <p>
                Arrastra una imagen o haz clic para seleccionar
                <span className="block text-xs text-blue-600 mt-1">
                  Se guardará como /images/logo.img (con extensión universal)
                </span>
              </p>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className="mt-2 px-4 py-1 bg-gray-200 rounded font-semibold"
        onClick={openModal}
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
              La imagen seleccionada se copiará como /images/logo.img (con extensión universal)
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

export default ImageUploaderLogo;
