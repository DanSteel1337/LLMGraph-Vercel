import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// If this file contains JSX, it should be renamed to utils.tsx
// However, since we don't have the full content, I'm just checking if it needs to be updated
