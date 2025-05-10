'use client';

import React, { useState, useEffect } from 'react';
// Define ProjectDisplayType locally since Prisma import may not work
type ProjectDisplayType = 'SINGLE' | 'GALLERY' | 'SLIDER' | 'GRID';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Importar Swiper y sus estilos
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProjectGalleryProps {
  images: string[];
  displayType: ProjectDisplayType;
}

export default function ProjectGallery({ images, displayType }: ProjectGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Abrir lightbox
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // Renderizar galería según el tipo de visualización
  switch (displayType) {
    case 'SINGLE':
      // Mostrar solo la primera imagen a tamaño completo
      return (
        <div className="w-full">
          {images.length > 0 && (
            <img
              src={images[0]}
              alt="Project image"
              className="w-full h-auto rounded-lg cursor-pointer"
              onClick={() => openLightbox(0)}
            />
          )}
          
          {/* Lightbox */}
          <LightboxDialog
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            images={images}
            currentIndex={currentImageIndex}
          />
        </div>
      );

    case 'SLIDER':
      // Mostrar imágenes en un slider
      return (
        <div className="w-full">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="rounded-lg overflow-hidden"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative aspect-video">
                  <img
                    src={image}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openLightbox(index)}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Lightbox */}
          <LightboxDialog
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            images={images}
            currentIndex={currentImageIndex}
          />
        </div>
      );

    case 'GRID':
      // Mostrar imágenes en una cuadrícula mejorada
      return (
        <div>
          {/* Cuadrícula de imágenes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                style={{ aspectRatio: '4/3' }} // Proporción fija para todas las imágenes
                onClick={() => openLightbox(index)}
              >
                {/* Imagen */}
                <img
                  src={image}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                />
                
                {/* Overlay al hacer hover - Más sutil */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Lightbox */}
          <LightboxDialog
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            images={images}
            currentIndex={currentImageIndex}
          />
        </div>
      );

    case 'GALLERY':
    default:
      // Galería con imagen principal y miniaturas
      return (
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={`Project image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openLightbox(currentImageIndex)}
            />
          </div>
          
          {/* Miniaturas */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden cursor-pointer ${
                  index === currentImageIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Lightbox */}
          <LightboxDialog
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            images={images}
            currentIndex={currentImageIndex}
          />
        </div>
      );
  }
}

// Componente para el lightbox
interface LightboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  currentIndex: number;
}

// Versión simplificada del lightbox para garantizar que funcione
function LightboxDialog({ open, onOpenChange, images, currentIndex }: LightboxDialogProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  
  // Restablecer el índice cuando se abre el lightbox
  useEffect(() => {
    if (open) {
      setActiveIndex(currentIndex);
    }
  }, [open, currentIndex]);
  
  // Funciones de navegación
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };
  
  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  // Detectar teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'Escape':
          onOpenChange(false);
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, images.length]);
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-7xl w-[95vw] h-[90vh] p-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Imagen actual */}
          <div className="flex-1 w-full flex items-center justify-center p-4 relative">
            <img
              key={activeIndex} // Forzar re-render al cambiar la imagen
              src={images[activeIndex]}
              alt={`Imagen ampliada ${activeIndex + 1} de ${images.length}`}
              className="max-h-[70vh] max-w-full object-contain"
            />
            
            {/* Botones de navegación */}
            <button 
              onClick={goPrev}
              className="absolute left-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Imagen anterior"
            >
              ←
            </button>
            
            <button 
              onClick={goNext}
              className="absolute right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Imagen siguiente"
            >
              →
            </button>
          </div>
          
          {/* Miniaturas/Indicadores */}
          <div className="flex justify-center gap-1 my-2 overflow-auto px-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === activeIndex ? 'bg-white' : 'bg-gray-500'
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
          
          {/* Contador */}
          <div className="text-center text-sm text-white/70 my-2">
            {activeIndex + 1} / {images.length}
          </div>
          
          {/* No usamos un botón de cierre personalizado para evitar duplicados con el del Dialog */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
