import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * Props para ImageUploader
 */
interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  multiple?: boolean;
}

/**
 * Componente reutilizable para subir o seleccionar imágenes existentes.
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = "Selecciona o arrastra una imagen",
  multiple = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("file", file));
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (multiple && Array.isArray(data.urls)) {
        onChange(data.urls[0]);
      } else {
        onChange(data.urls);
      }
    } else {
      alert("Error al subir la imagen");
    }
  }, [onChange, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple,
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
          <p>
            {value ? (
              <img src={value} alt="Imagen seleccionada" className="mx-auto max-h-32 mb-2" />
            ) : (
              "Arrastra una imagen o haz clic para seleccionar"
            )}
          </p>
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
            <button
              className="absolute top-2 right-2 text-gray-500 text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Selecciona una imagen existente</h2>
            {loading ? (
              <p>Cargando imágenes...</p>
            ) : existingImages.length === 0 ? (
              <p>No hay imágenes subidas.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4 max-h-72 overflow-y-auto">
                {existingImages.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt="Imagen existente"
                    style={{ maxHeight: "96px", maxWidth: "100%", objectFit: "cover" }}
                    className={`cursor-pointer border-2 rounded shadow-sm transition ${value === img ? "border-blue-500" : "border-gray-200"}`}
                    onClick={() => {
                      onChange(img);
                      setShowModal(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;