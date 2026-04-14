/**
 * Shared utility functions used across the entire app
 * Server-safe: no browser APIs — can be imported in server and client components
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn utility — merges Tailwind classes safely, resolving conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format an ISO date string to a human-readable string
// Example: '2026-03-15' → 'Mar 15, 2026'
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format a number to a USD price string
// Example: 5500 → '$5,500.00'
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Calculate booking total price — ALWAYS computed server-side, never from client input
// Formula: base_price + (total_weight_kg × per_kg_rate)
export function calculatePrice(
  basePrice: number,
  totalWeightKg: number,
  perKgRate: number,
): number {
  return basePrice + totalWeightKg * perKgRate
}

// Capitalize the first letter of a string
// Example: 'approved' → 'Approved'
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Convert an underscore_separated status to Title Case
// Example: 'out_for_delivery' → 'Out For Delivery'
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => capitalize(word))
    .join(' ')
}
