// Mapping of Tailwind color classes to their RGB values
export const tailwindColorMap: Record<string, string> = {
  // Blues
  'blue-300': 'rgb(147, 197, 253)',
  'blue-400': 'rgb(96, 165, 250)',
  'blue-500': 'rgb(59, 130, 246)',
  'blue-600': 'rgb(37, 99, 235)',
  'blue-700': 'rgb(29, 78, 216)',
  'blue-800': 'rgb(30, 64, 175)',
  'blue-900': 'rgb(30, 58, 138)',
  'blue-950': 'rgb(23, 37, 84)',
  
  // Cyans
  'cyan-300': 'rgb(103, 232, 249)',
  'cyan-400': 'rgb(34, 211, 238)',
  'cyan-500': 'rgb(6, 182, 212)',
  'cyan-600': 'rgb(8, 145, 178)',
  'cyan-700': 'rgb(14, 116, 144)',
  
  // Teals
  'teal-400': 'rgb(45, 212, 191)',
  'teal-500': 'rgb(20, 184, 166)',
  'teal-600': 'rgb(13, 148, 136)',
  'teal-700': 'rgb(15, 118, 110)',
  
  // Oranges
  'orange-400': 'rgb(251, 146, 60)',
  'orange-500': 'rgb(249, 115, 22)',
  'orange-600': 'rgb(234, 88, 12)',
  
  // Reds
  'red-500': 'rgb(239, 68, 68)',
  'red-600': 'rgb(220, 38, 38)',
  'red-700': 'rgb(185, 28, 28)',
  
  // Yellows
  'yellow-300': 'rgb(253, 224, 71)',
  'yellow-400': 'rgb(250, 204, 21)',
  'yellow-500': 'rgb(234, 179, 8)',
  
  // Ambers
  'amber-400': 'rgb(251, 191, 36)',
  'amber-500': 'rgb(245, 158, 11)',
  'amber-600': 'rgb(217, 119, 6)',
  
  // Indigos
  'indigo-300': 'rgb(165, 180, 252)',
  'indigo-400': 'rgb(129, 140, 248)',
  'indigo-500': 'rgb(99, 102, 241)',
  'indigo-600': 'rgb(79, 70, 229)',
  'indigo-700': 'rgb(67, 56, 202)',
  
  // Slates
  'slate-50': 'rgb(248, 250, 252)',
  'slate-100': 'rgb(241, 245, 249)',
  'slate-900': 'rgb(15, 23, 42)',
  
  // Teals
  'teal-50': 'rgb(240, 253, 250)',
  'teal-900': 'rgb(19, 78, 74)'
};

/**
 * Get the RGB value for a Tailwind color class
 * @param colorClass - The Tailwind color class (e.g., 'blue-700')
 * @returns The RGB value or a fallback color
 */
export function getTailwindColor(colorClass: string): string {
  // If the color includes a hyphen, it's likely a Tailwind color class
  if (colorClass.includes('-')) {
    return tailwindColorMap[colorClass] || 'rgb(107, 114, 128)'; // Default to gray-500 if not found
  }
  
  // For simple color names without variants
  switch (colorClass) {
    case 'red': return 'rgb(239, 68, 68)';
    case 'yellow': return 'rgb(234, 179, 8)';
    case 'purple': return 'rgb(168, 85, 247)';
    case 'pink': return 'rgb(236, 72, 153)';
    case 'indigo': return 'rgb(99, 102, 241)';
    case 'gray': return 'rgb(107, 114, 128)';
    case 'white': return 'rgb(255, 255, 255)';
    case 'black': return 'rgb(0, 0, 0)';
    default: return 'rgb(107, 114, 128)'; // Default to gray-500
  }
}