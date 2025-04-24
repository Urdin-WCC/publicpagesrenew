'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Select from 'react-select';

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  previewText?: string;
  commonFonts?: string[];
}

export function FontSelector({
  label,
  value,
  onChange,
  previewText = 'Texto de ejemplo',
  commonFonts = [
    "Arial, sans-serif",
    "Helvetica, Arial, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Impact, sans-serif",
    "Comic Sans MS, cursive",
    "Roboto, sans-serif",
    "Open Sans, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Raleway, sans-serif",
    "Poppins, sans-serif",
    "Merriweather, serif",
    "Playfair Display, serif"
  ]
}: FontSelectorProps) {
  // Estado para la fuente personalizada
  const [customFont, setCustomFont] = useState<string>('');
  
  // Convertir fuentes comunes para react-select
  const fontOptions = commonFonts.map(font => ({
    value: font,
    label: font.split(',')[0], // Mostrar solo el primer nombre de la fuente
  }));
  
  // Estado para la opción seleccionada en Select
  const [selectedOption, setSelectedOption] = useState<any>(null);
  
  // Inicialización: Determinar si el valor inicial es una fuente común o personalizada
  useEffect(() => {
    const option = fontOptions.find(option => option.value === value);
    if (option) {
      setSelectedOption(option);
      setCustomFont('');
    } else if (value && !option) {
      setSelectedOption(null);
      setCustomFont(value);
    }
    // Este efecto solo se ejecuta una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Manejar cambio en el selector de fuentes
  const handleSelectChange = (selectedOption: any) => {
    if (selectedOption) {
      setSelectedOption(selectedOption);
      setCustomFont('');
      onChange(selectedOption.value);
    }
  };
  
  // Manejar cambio en la entrada de texto personalizada
  const handleCustomFontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomFont(newValue);
    setSelectedOption(null);
    if (newValue) {
      onChange(newValue);
    }
  };
  
  // Estilos personalizados para react-select
  const customStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      fontFamily: state.data.value,
    }),
    singleValue: (provided: any, state: any) => ({
      ...provided,
      fontFamily: state.data.value,
    }),
  };

  return (
    <div className="space-y-2 mb-4">
      <Label>{label}</Label>
      <div className="space-y-3">
        <Select
          value={selectedOption}
          onChange={handleSelectChange}
          options={fontOptions}
          styles={customStyles}
          placeholder="Seleccionar fuente..."
          isClearable
        />
        
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap">O fuente personalizada</Label>
          <Input
            value={customFont}
            onChange={handleCustomFontChange}
            placeholder="Ej: Roboto, sans-serif"
          />
        </div>
        
        {/* Preview del texto con la fuente seleccionada */}
        <div 
          className="p-3 border rounded mt-2"
          style={{ fontFamily: value || 'inherit' }}
        >
          {previewText}
        </div>
      </div>
    </div>
  );
}
