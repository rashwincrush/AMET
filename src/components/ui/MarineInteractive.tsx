'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

type SchoolType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

type MarineInteractiveProps = {
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

export  function MarineInteractive({ schools = defaultSchools, className = '' }: MarineInteractiveProps) {
  const [activeSchool, setActiveSchool] = useState<string>(schools[0].id);
  const [wavePosition, setWavePosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animate the waves
  useEffect(() => {
    const interval = setInterval(() => {
      setWavePosition((prev) => (prev + 1) % 100);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Get the active school data
  const getActiveSchool = () => {
    return schools.find(school => school.id === activeSchool) || schools[0];
  };

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${className}`} ref={containerRef}>
      {/* Animated Ocean Background */}
      <div className="absolute inset-0 z-0 bg-blue-900">
        {/* Animated Waves */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 bg-blue-500 opacity-30"
          style={{ 
            transform: `translateX(${wavePosition}px)`,
            backgroundSize: '1200px 100%',
            height: '150px',
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 bg-blue-400 opacity-40"
          style={{ 
            transform: `translateX(-${wavePosition * 1.5}px)`,
            backgroundSize: '1200px 100%',
            height: '120px',
          }}
        ></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-8 min-h-[500px] flex flex-col">
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
        <div className="flex-1 flex flex-col items-center justify-center text-white p-4 transition-all duration-500 transform">
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 max-w-2xl w-full">
            <div className="text-5xl mb-4">{getActiveSchool().icon}</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{getActiveSchool().name}</h2>
            <p className="text-lg opacity-90 mb-6">{getActiveSchool().description}</p>
            
            {/* Interactive Element based on school type */}
            <div className="mt-6">
              {activeSchool === 'nautical' && (
                <div className="relative h-24 bg-blue-800/50 rounded-lg overflow-hidden">
                  <div 
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-8 bg-gray-200 rounded transition-all duration-300"
                    style={{ left: `${wavePosition}%` }}
                  >
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-4 bg-red-500"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-blue-500/50"></div>
                  <div className="absolute top-2 left-4 text-xs text-white">Ship Navigation Simulator</div>
                </div>
              )}
              
              {activeSchool === 'marine' && (
                <div className="relative h-24 bg-cyan-800/50 rounded-lg overflow-hidden">
                  <div className="flex justify-around items-end h-full pb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="w-4 bg-cyan-300 rounded-t-md transition-all duration-300" 
                        style={{ 
                          height: `${Math.sin((wavePosition + i * 10) * 0.1) * 30 + 50}%`,
                          opacity: 0.7 + Math.sin((wavePosition + i * 10) * 0.1) * 0.3
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="absolute top-2 left-4 text-xs text-white">Marine Engineering Waves</div>
                </div>
              )}
              
              {activeSchool === 'ocean' && (
                <div className="relative h-24 bg-teal-800/50 rounded-lg overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-12 flex items-end">
                    <div className="w-16 h-16 bg-gray-300 rounded-md transform translate-y-8 ml-4">
                      <div className="w-full h-2 bg-gray-400 absolute top-2"></div>
                      <div className="w-full h-2 bg-gray-400 absolute top-6"></div>
                      <div className="w-2 h-8 bg-gray-500 absolute top-0 right-3"></div>
                    </div>
                    <div className="w-24 h-6 bg-yellow-700 rounded-t-md ml-12 relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-600"></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-teal-500/50"></div>
                  <div className="absolute top-2 left-4 text-xs text-white">Offshore Structures</div>
                </div>
              )}
              
              {activeSchool === 'energy' && (
                <div className="relative h-24 bg-yellow-800/50 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-yellow-300 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                      <div className="absolute inset-2 border-4 border-yellow-500 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
                      <div className="absolute inset-4 border-4 border-yellow-600 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-6 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-4 text-xs text-white">Energy Generation</div>
                </div>
              )}
              
              {activeSchool === 'business' && (
                <div className="relative h-24 bg-indigo-800/50 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 items-end">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className="w-8 mx-1 bg-indigo-400 rounded-t-md transition-all duration-500" 
                          style={{ 
                            height: `${(i * 15) + Math.sin((wavePosition + i * 20) * 0.05) * 15}%`,
                          }}
                        >
                          <div className="w-full h-1 bg-indigo-200"></div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-2 w-full border-b border-dashed border-white/50"></div>
                    <div className="absolute bottom-6 w-full border-b border-dashed border-white/30"></div>
                  </div>
                  <div className="absolute top-2 left-4 text-xs text-white">Maritime Business Analytics</div>
                </div>
              )}
              
              {activeSchool === 'life' && (
                <div className="relative h-24 bg-green-800/50 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full flex justify-center items-center">
                      {/* DNA Helix Animation */}
                      <div className="relative h-16 w-8">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <div key={i} className="absolute top-0 left-0 w-full h-full">
                            <div 
                              className="absolute h-2 w-2 bg-green-300 rounded-full"
                              style={{
                                left: `${Math.sin((wavePosition * 0.1) + i * 0.8) * 100 + 100}%`,
                                top: `${i * 12.5}%`,
                                transform: 'translateX(-50%)',
                                opacity: 0.7 + Math.sin((wavePosition * 0.1) + i * 0.8) * 0.3
                              }}
                            ></div>
                            <div 
                              className="absolute h-2 w-2 bg-blue-300 rounded-full"
                              style={{
                                left: `${Math.sin((wavePosition * 0.1) + i * 0.8 + Math.PI) * 100 + 100}%`,
                                top: `${i * 12.5}%`,
                                transform: 'translateX(-50%)',
                                opacity: 0.7 + Math.sin((wavePosition * 0.1) + i * 0.8 + Math.PI) * 0.3
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                      {/* Seaweed */}
                      <div className="absolute bottom-0 left-4">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i} 
                            className="absolute bottom-0 w-1 bg-green-500 rounded-t-full"
                            style={{
                              height: `${10 + i * 3}px`,
                              left: `${i * 5}px`,
                              transform: `rotate(${Math.sin((wavePosition + i * 10) * 0.1) * 10}deg)`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 left-4 text-xs text-white">Marine Biotechnology</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}