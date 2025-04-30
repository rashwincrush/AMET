'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { useTheme } from './theme-provider';

type SchoolType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

type EnhancedMarineInteractiveProps = {
  schools?: SchoolType[];
  className?: string;
};

// Default schools data with marine/nautical themes
const defaultSchools: SchoolType[] = [
  {
    id: 'nautical',
    name: 'School of Nautical Science',
    description: 'Focuses on Nautical Science and Pre-Sea Modular Programmes.',
    icon: '🚢',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'marine',
    name: 'School of Marine Science',
    description: 'Specializes in Marine Engineering.',
    icon: '🌊',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    id: 'ocean',
    name: 'School of Ocean Engineering',
    description: 'Offers courses in Naval Architecture & Offshore Engineering and Harbour & Ocean Engineering.',
    icon: '🌊',
    color: 'from-teal-500 to-teal-700',
  },
  {
    id: 'energy',
    name: 'School of Energy Engineering',
    description: 'Provides programs in Mining Engineering, Petroleum Engineering, Electrical and Electronics Engineering, and Mechanical Engineering.',
    icon: '⚡',
    color: 'from-yellow-500 to-yellow-700',
  },
  {
    id: 'business',
    name: 'AMET Business School',
    description: 'Covers Business Studies with a focus on the maritime sector.',
    icon: '📊',
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    id: 'life',
    name: 'School of Life Science',
    description: 'Includes Marine Biotechnology and Food Processing Technology.',
    icon: '🧬',
    color: 'from-green-500 to-green-700',
  },
];

export  function EnhancedMarineInteractive({ schools = defaultSchools, className = '' }: EnhancedMarineInteractiveProps) {
  const [activeSchool, setActiveSchool] = useState<string>(schools[0].id);
  const [wavePosition, setWavePosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Using simplified theme approach
  const { themeOptions } = useTheme();
  
  // Animate the waves
  useEffect(() => {
    const interval = setInterval(() => {
      setWavePosition((prev) => (prev + 1) % 100);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Track mouse position for interactive elements
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
  };

  // Get the active school data
  const getActiveSchool = () => {
    return schools.find(school => school.id === activeSchool) || schools[0];
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-lg ${className}`} 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Ocean Background */}
      <div className="absolute inset-0 z-0 bg-blue-900">
        {/* Deep Water Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-800 opacity-80"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-8 min-h-[600px] flex flex-col">
        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {schools.map((school) => (
            <Button
              key={school.id}
              variant={activeSchool === school.id ? 'default' : 'outline'}
              onClick={() => setActiveSchool(school.id)}
              className={`transition-all duration-300 ${activeSchool === school.id ? `bg-gradient-to-r ${school.color} text-white` : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
            >
              <span className="mr-2">{school.icon}</span>
              {school.name.split(' ').slice(-1)[0]}
            </Button>
          ))}
        </div>

        {/* Active School Content */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
          {/* School Icon */}
          <div 
            className={`flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${getActiveSchool().color} p-2 shadow-lg`}
          >
            <span className="text-6xl">{getActiveSchool().icon}</span>
          </div>
          
          {/* School Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{getActiveSchool().name}</h3>
            <p className="text-blue-100 mb-4">{getActiveSchool().description}</p>
            
            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button 
                variant="default" 
                className={`bg-gradient-to-r ${getActiveSchool().color} hover:opacity-90 text-white`}
              >
                Explore Programs
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              >
                Meet Alumni
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}