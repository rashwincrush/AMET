'use client';

// This component is client-

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavigationItem = {
  name: string;
  href: string;
  icon?: string;
};

type CompassNavigationProps = {
  items: NavigationItem[];
  className?: string;
};

export  function CompassNavigation({ 
  items = [], 
  className = '' 
}: CompassNavigationProps) {
  const pathname = usePathname();
  const [rotation, setRotation] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const compassRef = useRef<HTMLDivElement>(null);
  
  // Find active navigation item based on current path
  useEffect(() => {
    const index = items.findIndex(item => item.href === pathname);
    if (index !== -1) {
      setActiveIndex(index);
      // Calculate rotation to point to active item
      const newRotation = -(index * (360 / items.length));
      setRotation(newRotation);
    }
  }, [pathname, items]);

  // Handle mouse movement for compass needle
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!compassRef.current) return;
    
    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle between mouse and center
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    setRotation(angle + 90); // Adjust to point correctly
  };

  // Navigate to the selected item
  const navigateTo = (index: number) => {
    setActiveIndex(index);
    // Calculate rotation to point to active item
    const newRotation = -(index * (360 / items.length));
    setRotation(newRotation);
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        // Reset to active item when mouse leaves
        const newRotation = -(activeIndex * (360 / items.length));
        setRotation(newRotation);
      }}
    >
      <div 
        ref={compassRef}
        className="relative w-64 h-64 mx-auto bg-gradient-to-b from-blue-800 to-blue-950 rounded-full shadow-xl overflow-hidden border-4 border-amber-600/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      >
        {/* Compass Rose Background */}
        <div className="absolute inset-0 bg-blue-800 rounded-full">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Compass Rose Lines */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full h-0.5 bg-white/30 transform origin-center"
                style={{ transform: `rotate(${i * 22.5}deg)` }}
              ></div>
            ))}
            
            {/* Cardinal Points */}
            <div className="absolute top-4 text-white font-bold">N</div>
            <div className="absolute right-4 text-white font-bold">E</div>
            <div className="absolute bottom-4 text-white font-bold">S</div>
            <div className="absolute left-4 text-white font-bold">W</div>
          </div>
        </div>
        
        {/* Navigation Items around the compass */}
        {items.map((item, index) => {
          const angle = (index * (360 / items.length)) * (Math.PI / 180);
          const radius = 100; // Distance from center
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius;
          
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
              style={{ 
                left: `calc(50% + ${x}px)`, 
                top: `calc(50% + ${y}px)`,
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => navigateTo(index)}
            >
              <div 
                className={`flex items-center justify-center w-12 h-12 rounded-full ${isActive ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'} hover:bg-gradient-to-br hover:from-amber-400 hover:to-amber-600 transition-all duration-300 shadow-lg backdrop-blur-sm border border-white/20`}
              >
                {item.icon ? (
                  <span className="text-xl">{item.icon}</span>
                ) : (
                  <span className="text-white font-bold">{item.name.charAt(0)}</span>
                )}
              </div>
              <div 
                className={`absolute whitespace-nowrap text-sm font-medium ${isActive ? 'text-amber-300' : 'text-white'} transition-all duration-300 ${hoverIndex === index ? 'opacity-100' : 'opacity-70'}`}
                style={{
                  transform: `translate(-50%, ${y < 0 ? '-100%' : '100%'}) translateY(${y < 0 ? '-8px' : '8px'})`,
                  left: '50%',
                }}
              >
                {item.name}
              </div>
            </Link>
          );
        })}
        
        {/* Compass Needle */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-32 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 origin-bottom transition-transform duration-300 z-20"
          style={{ transform: `translateX(-50%) translateY(-50%) rotate(${rotation}deg)` }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
        </div>
        
        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-amber-700 rounded-full z-30 border-2 border-amber-500 shadow-inner"></div>
      </div>
      
      {/* Compass Name */}
      <div className="text-center mt-4 text-lg font-bold text-blue-800">Navigation Compass</div>
    </div>
  );
}