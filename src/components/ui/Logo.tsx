'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Logo() {
  // Add console log to verify this component is being loaded
  useEffect(() => {
    console.log('DEBUG: Logo component mounted - ' + new Date().toISOString());
    console.log('DEBUG: Logo image path should be /images/logo.jpg');
  }, []);

  return (
    <Link href="/home" className="flex-shrink-0 flex items-center">
      <div className="flex flex-col items-center">
        <img 
          src="/images/logo.jpg" 
          alt="AMET Logo" 
          width="120" 
          height="40" 
          className="h-12 w-auto" 
          style={{ objectFit: 'contain' }}
        />
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded mt-1" style={{ position: 'absolute', top: '45px' }}>NEW LOGO VISIBLE</div>
      </div>
    </Link>
  );
}
