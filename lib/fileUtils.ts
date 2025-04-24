import path from 'path';
import fs from 'fs/promises';

/**
 * Base path for all file operations
 * This is the absolute path to the designated uploads directory
 * CRITICAL: All file operations must be restricted to this directory
 */
// Use path.join to ensure correct path resolution across different environments
export const BASE_UPLOADS_PATH = path.join(process.cwd(), 'public', 'uploads', 'images');

// Create the uploads directory if it doesn't exist (for first use)
export async function ensureUploadsDirectory() {
  try {
    await fs.access(BASE_UPLOADS_PATH);
  } catch (error) {
    // Directory doesn't exist, create it
    console.log(`Creating uploads directory: ${BASE_UPLOADS_PATH}`);
    await fs.mkdir(BASE_UPLOADS_PATH, { recursive: true });
  }
}

/**
 * Validates and resolves a relative path to ensure it stays within the base uploads directory.
 * This is a critical security function to prevent path traversal attacks.
 * 
 * @param relativePath The relative path to validate (e.g., "folder/image.jpg" or "folder")
 * @returns The validated absolute path or null if invalid
 */
export function resolveSecurePath(relativePath: string): string | null {
  // Handle empty path as root directory
  if (typeof relativePath !== 'string') {
    return null;
  }
  
  // Empty string represents the root directory
  if (relativePath === '') {
    return BASE_UPLOADS_PATH;
  }
  
  // Reject paths containing ".." which could be used for directory traversal
  if (relativePath.includes('..')) {
    return null;
  }
  
  // Reject paths containing characters that could be used for attacks
  // Note: this is a basic implementation, consider more robust validation if needed
  const invalidChars = ['~', ':', '*', '?', '"', '<', '>', '|'];
  if (invalidChars.some(char => relativePath.includes(char))) {
    return null;
  }
  
  // Join the base path with the relative path
  const absolutePath = path.join(BASE_UPLOADS_PATH, relativePath);

  // Check if the resolved path is still within the base uploads directory
  if (!absolutePath.startsWith(BASE_UPLOADS_PATH)) {
    return null;
  }
  
  return absolutePath;
}

/**
 * Sanitizes input to remove potentially harmful characters from file/folder names.
 * 
 * @param name The file or folder name to sanitize
 * @returns The sanitized name
 */
export function sanitizeInput(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  // Only allow alphanumeric, dash, underscore, and dots
  return name
    .replace(/[^a-zA-Z0-9\-_\.ñÑáéíóúÁÉÍÓÚüÜ]/g, '')
    .trim();
}

/**
 * Gets file type (file or folder) from a path
 * 
 * @param absolutePath The absolute path to check
 * @returns 'file', 'folder', or null if error
 */
export async function getFileType(absolutePath: string): Promise<'file' | 'folder' | null> {
  try {
    const stat = await fs.stat(absolutePath);
    return stat.isDirectory() ? 'folder' : 'file';
  } catch (error) {
    return null;
  }
}

/**
 * Gets relative path from absolute path
 * 
 * @param absolutePath The absolute path
 * @returns The path relative to BASE_UPLOADS_PATH
 */
export function getRelativePath(absolutePath: string): string {
  return path.relative(BASE_UPLOADS_PATH, absolutePath);
}
