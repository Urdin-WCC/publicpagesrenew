// Theme module types

export interface ThemeConfig {
  id?: number | string; // ID del tema
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
    imageUrl?: string;
  };
  typography?: {
    heading?: { 
      fontFamily?: string; 
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      fontStyle?: string; // normal, italic
      textDecoration?: string; // none, underline, line-through
      textTransform?: string; // none, uppercase, lowercase, capitalize
    };
    paragraph?: { 
      fontFamily?: string; 
      color?: string;
      fontSize?: string;
      fontWeight?: string;
      fontStyle?: string;
      textDecoration?: string;
      lineHeight?: string;
    };
    link?: { 
      fontFamily?: string; 
      color?: string; 
      hoverColor?: string;
      fontSize?: string;
      fontWeight?: string;
      fontStyle?: string;
      textDecoration?: string;
      hoverTextDecoration?: string;
    };
    button?: { 
      fontFamily?: string; 
      color?: string;
    };
  };
  spacing?: { 
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
      base?: string; // Mantener para compatibilidad
    };
    padding?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
      base?: string; // Mantener para compatibilidad
    };
  };
  cards?: {
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    background?: { 
      type: 'color' | 'gradient' | 'image'; 
      value: string; 
      imageUrl?: string;
    };
    shadow?: {
      x?: string;
      y?: string;
      blur?: string;
      spread?: string;
      color?: string;
    };
  };
  buttons?: {
    primary?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
      hoverBackgroundColor?: string;
      hoverTextColor?: string;
    };
    secondary?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
      hoverBackgroundColor?: string;
      hoverTextColor?: string;
    };
  };
  forms?: {
    input?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
      borderRadius?: string;
      focusBorderColor?: string;
    };
    label?: {
      textColor?: string;
      fontWeight?: string;
    };
  };
  effects?: {
    transitions?: boolean;
    animation?: 'none' | 'zoomin' | 'zoomout' | 'scale' | 'glow' | 'bounce' | 'pulse' | 'shake' | 'slide' | 'custom';
    customAnimation?: string;
  };
}
