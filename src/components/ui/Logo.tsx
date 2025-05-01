'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Logo() {


  return (
    <Link href="/home" className="flex-shrink-0 flex items-center">
      <div className="flex flex-col items-center">
        <img 
          src={`/images/logo.jpg?v=${new Date().getTime()}`} 
          alt="AMET Logo" 
          width="120" 
          height="40" 
          className="h-12 w-auto" 
          style={{ objectFit: 'contain' }}
          onError={(e) => {
            e.currentTarget.src = `/images/logo/logo.jpg?v=${new Date().getTime()}`;
          }}
        />

      </div>
    </Link>
  );
}
