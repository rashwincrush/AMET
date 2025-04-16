/**
 * This file provides a mapping between Tailwind CSS color classes and their corresponding hex values.
 * It's used by the theme providers to convert Tailwind color classes to CSS variables.
 */

type TailwindColorMap = {
  [key: string]: string;
};

// Mapping of Tailwind color classes to their hex values
const tailwindColors: TailwindColorMap = {
  // Gray scale
  'slate-50': '#f8fafc',
  'slate-100': '#f1f5f9',
  'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1',
  'slate-400': '#94a3b8',
  'slate-500': '#64748b',
  'slate-600': '#475569',
  'slate-700': '#334155',
  'slate-800': '#1e293b',
  'slate-900': '#0f172a',
  
  // Cyan
  'cyan-300': '#67e8f9',
  'cyan-400': '#22d3ee',
  'cyan-500': '#06b6d4',
  
  // Amber
  'amber-300': '#fcd34d',
  'amber-400': '#fbbf24',
  'amber-500': '#f59e0b',
  'amber-600': '#d97706',
  
  // Violet
  'violet-300': '#c4b5fd',
  'violet-400': '#a78bfa',
  'violet-500': '#8b5cf6',
  'violet-600': '#7c3aed',
  
  // Amber
  'amber-400': '#fbbf24',
  'amber-500': '#f59e0b',
  'amber-600': '#d97706',
  
  // Orange
  'orange-400': '#fb923c',
  'orange-500': '#f97316',
  'orange-600': '#ea580c',
  'orange-700': '#c2410c',
  
  // Purple
  'purple-400': '#c084fc',
  'purple-500': '#a855f7',
  'purple-600': '#9333ea',
  'purple-700': '#7e22ce',
  
  // Indigo
  'indigo-400': '#818cf8',
  'indigo-500': '#6366f1',
  'indigo-600': '#4f46e5',
  
  // Standard colors
  'white': '#ffffff',
  'black': '#000000',
};

/**
 * Gets the hex color value for a given Tailwind color class
 * @param colorName The Tailwind color class name (e.g., 'blue-500')
 * @returns The corresponding hex color value
 */
export function getTailwindColor(colorName: string): string {
  return tailwindColors[colorName] || '#000000';
}