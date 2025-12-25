import { type ClassValue,clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 * Useful for conditional classes and overriding default styles
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
