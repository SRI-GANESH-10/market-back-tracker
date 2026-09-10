import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const inr = (n: number) =>
  n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export const compactInr = (n: number) =>
  n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  })

export const pct = (n: number) => `${(n * 100).toFixed(2)}%`

export const signedInr = (n: number) => (n >= 0 ? '+' : '−') + inr(Math.abs(n))

export const signedPct = (n: number) => (n >= 0 ? '+' : '−') + pct(Math.abs(n))
