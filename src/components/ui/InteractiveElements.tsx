'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type InteractiveElementsProps = {
  className?: string;
}

export  function InteractiveElements({ className = '' }: InteractiveElementsProps) {
  const [alumniStats, setAlumniStats] = useState<{
    total: number;
    byYear: Record<string, number>;
    byIndustry: Record<string, number>;
  }>({
    total: 0,
    byYear: {},
    byIndustry: {},
  });
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'year' | 'industry'>('year');
  
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAlumniStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch total alumni count
        const { count: totalCount, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        // Fetch alumni by graduation year
        const { data: graduationData, error: graduationError } = await supabase
          .from('profiles')
          .select('graduation_year')
          .not('graduation_year', 'is', null);
          
        if (graduationError) throw graduationError;
        
        // Fetch alumni by industry
        const { data: industryData, error: industryError } = await supabase
          .from('profiles')
          .select('industry')
          .not('industry', 'is', null);
          
        if (industryError) throw industryError;
        
        // Process graduation year data
        const byYear: Record<string, number> = {};
        graduationData.forEach((item: { graduation_year?: number }) => {
          const year = item.graduation_year?.toString() || 'Unknown';
          byYear[year] = (byYear[year] || 0) + 1;
        });
        
        // Process industry data
        const byIndustry: Record<string, number> = {};
        industryData.forEach((item: { industry?: string }) => {
          const industry = item.industry || 'Unknown';
          byIndustry[industry] = (byIndustry[industry] || 0) + 1;
        });
        
        setAlumniStats({
          total: totalCount || 0,
          byYear,
          byIndustry,
        });
      } catch (err: any) {
        console.error('Error fetching alumni stats:', err);
        setError(err.message || 'Failed to load alumni statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlumniStats();
  }, []);
  
  const handleBarHover = (key: string, value: number, event: React.MouseEvent) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setTooltipContent(`${key}: ${value} alumni`);
    setTooltipPosition({ x, y });
    setShowTooltip(true);
  };
  
  const handleBarLeave = () => {
    setShowTooltip(false);
  };
  
  const getMaxValue = () => {
    const data = activeTab === 'year' ? alumniStats.byYear : alumniStats.byIndustry;
    const values = Object.values(data);
    return values.length > 0 ? Math.max(...values) : 0;
  };
  
  const renderBars = () => {
    const data = activeTab === 'year' ? alumniStats.byYear : alumniStats.byIndustry;
    const maxValue = getMaxValue();
    
    return Object.entries(data)
      .sort((a, b) => {
        if (activeTab === 'year') {
          // Handle non-numeric year values
          const yearA = !isNaN(parseInt(a[0])) ? parseInt(a[0]) : 0;
          const yearB = !isNaN(parseInt(b[0])) ? parseInt(b[0]) : 0;
          return yearA - yearB;
        }
        return b[1] - a[1]; // Sort industries by count descending
      })
      .slice(0, 20) // Limit to 20 items for better display
      .map(([key, value]) => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <div
            key={key}
            className="relative flex-1 min-w-[30px] mx-1"
            onMouseEnter={(e) => handleBarHover(key, value, e)}
            onMouseLeave={handleBarLeave}
          >
            <div 
              className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500"
              style={{ height: `${height}%` }}
            />
            <div className="absolute bottom-[-25px] w-full text-center text-xs truncate">
              {activeTab === 'year' ? key : key.length > 10 ? `${key.substring(0, 10)}...` : key}
            </div>
          </div>
        );
      });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Alumni Statistics</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center h-64 flex items-center justify-center">
          {error}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-3xl font-bold">{alumniStats.total}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('year')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'year'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                By Year
              </button>
              <button
                onClick={() => setActiveTab('industry')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'industry'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                By Industry
              </button>
            </div>
          </div>
          
          <div className="relative h-64 mb-8" ref={chartRef}>
            <div className="absolute inset-0 flex items-end">
              {renderBars()}
            </div>
            
            {showTooltip && (
              <div
                className="absolute bg-black text-white text-xs rounded px-2 py-1 z-10 pointer-events-none"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y - 30}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                {tooltipContent}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}