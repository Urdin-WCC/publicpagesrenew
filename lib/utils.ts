import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a given string.
 * Converts to lowercase, removes accents, replaces spaces and non-alphanumeric characters with hyphens.
 * @param text The input string (e.g., a title).
 * @returns The generated slug.
 */
export function generateSlug(text: string): string {
  if (!text) return ''; // Handle empty input
  return text
    .toString()
    .normalize('NFD') // Normalize accents (e.g., é -> e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces and sequences of spaces with a single hyphen
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single hyphen
}
