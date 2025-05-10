import { promises as fs } from 'fs';
import path from 'path';

/**
 * Busca archivos que comienzan con el nombre base especificado en un directorio
 * y devuelve la ruta del primer archivo encontrado.
 * 
 * @param directory Directorio donde buscar
 * @param baseFileName Nombre base del archivo sin extensión
 * @returns Ruta completa del primer archivo encontrado, o null si no se encuentra ninguno
 */
export async function findFileByBaseName(directory: string, baseFileName: string): Promise<string | null> {
  try {
    const files = await fs.readdir(directory);
    
    // Buscar archivos que comiencen con el nombre base
    const matchingFile = files.find(file => file.startsWith(baseFileName + '.'));
    
    if (matchingFile) {
      return path.join(directory, matchingFile);
    }
    
    return null;
  } catch (error) {
    console.error(`Error buscando archivo con nombre base ${baseFileName}:`, error);
    return null;
  }
}

/**
 * Busca una imagen por su nombre base (sin extensión) y devuelve la URL relativa
 * Prioriza la extensión .img si existe, luego busca otras extensiones comunes
 * 
 * @param baseImagePath Ruta base de la imagen sin extensión (ej: '/images/logo')
 * @returns URL relativa de la imagen encontrada, o la ruta base con extensión .img como fallback
 */
export async function findImageByBasePath(baseImagePath: string): Promise<string> {
  try {
    // Verificar si la ruta ya incluye una extensión
    if (/\.(png|jpe?g|gif|svg|webp|avif|img)$/i.test(baseImagePath)) {
      return baseImagePath; // Si ya tiene extensión, devolver como está
    }
    
    // Obtener el directorio y el nombre base del archivo
    const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.substring(1) : baseImagePath;
    const directory = path.join(process.cwd(), 'public', path.dirname(normalizedPath));
    const baseFileName = path.basename(normalizedPath);
    
    try {
      // Buscar archivos que coincidan con el nombre base
      const files = await fs.readdir(directory);
      
      // Primero verificar si existe el archivo con extensión .img
      const imgFile = files.find(file => file === `${baseFileName}.img`);
      if (imgFile) {
        return `${path.dirname(baseImagePath)}/${imgFile}`.replace(/\\/g, '/');
      }
      
      // Si no hay .img, buscar cualquier archivo que coincida con el nombre base
      const matchingFile = files.find(file => file.startsWith(baseFileName + '.'));
      if (matchingFile) {
        return `${path.dirname(baseImagePath)}/${matchingFile}`.replace(/\\/g, '/');
      }
    } catch (readDirError) {
      console.error(`Error leyendo directorio para ${baseImagePath}:`, readDirError);
    }
    
    // Si no se encuentra ningún archivo o hay error al leer el directorio,
    // devolver la ruta base con extensión .img como fallback
    return `${baseImagePath}.img`;
  } catch (error) {
    console.error(`Error buscando imagen ${baseImagePath}:`, error);
    // Devolver la ruta base con extensión .img como fallback
    return `${baseImagePath}.img`;
  }
}

/**
 * Versión del lado del cliente para resolver imágenes con una extensión universal.
 * Esta función utiliza la extensión .img para todas las imágenes, independientemente
 * de su formato real, lo que permite al servidor resolverlas correctamente.
 * 
 * @param baseImagePath Ruta base de la imagen (ej: '/images/logo')
 * @returns URL con extensión universal .img
 */
export function findImageClientSide(baseImagePath: string): string {
  // Si la ruta ya tiene extensión, extraemos la parte base
  let basePath = baseImagePath;
  if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(baseImagePath)) {
    basePath = baseImagePath.substring(0, baseImagePath.lastIndexOf('.'));
  }
  
  // Usamos la extensión universal .img para todas las imágenes
  return `${basePath}.img`;
}
