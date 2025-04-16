'use client';

import { useEffect, useRef } from 'react';

type MarineBackgroundProps = {
  className?: string;
};

export  function MarineBackground({ className = '' }: MarineBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Wave parameters
    const waves = [
      { y: canvas.height * 0.65, amplitude: 20, frequency: 0.02, speed: 0.05, color: 'rgba(255, 255, 255, 0.1)' },
      { y: canvas.height * 0.7, amplitude: 15, frequency: 0.04, speed: 0.03, color: 'rgba(255, 255, 255, 0.15)' },
      { y: canvas.height * 0.75, amplitude: 10, frequency: 0.06, speed: 0.02, color: 'rgba(255, 255, 255, 0.2)' },
    ];
    
    // Particles for underwater effect
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;
    }> = [];
    
    // Create particles
    const createParticles = () => {
      const particleCount = Math.floor(canvas.width / 30); // Adjust density
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.8 + canvas.height * 0.2, // Only in bottom 80%
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };
    
    createParticles();
    
    // Animation variables
    let animationFrameId: number;
    let time = 0;
    
    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw waves
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, wave.y);
        
        for (let x = 0; x < canvas.width; x++) {
          const y = wave.y + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        ctx.fillStyle = wave.color;
        ctx.fill();
      });
      
      // Draw particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        // Move particles
        particle.y -= particle.speed;
        
        // Reset particles that go off-screen
        if (particle.y < 0) {
          particle.y = canvas.height;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      time += 0.01;
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 z-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}