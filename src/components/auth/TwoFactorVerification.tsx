"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Shield, Mail, RefreshCw } from 'lucide-react';

interface TwoFactorVerificationProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerification({ 
  email, 
  onSuccess, 
  onCancel 
}: TwoFactorVerificationProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    // Simulate sending verification code when component mounts
    sendVerificationCode();
  }, []);
  
  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would send a verification code to the user's email
      // For demo purposes, we'll simulate this process
      
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start countdown for resend button (60 seconds)
      setCountdown(60);
      
      toast.success('Verification code sent to your email');
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code: verificationCode,
          rememberDevice
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }
      
      toast.success('Verification successful');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResend = () => {
    if (countdown === 0) {
      sendVerificationCode();
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <Shield size={28} />
        </div>
        <h2 className="text-2xl font-bold">Two-Factor Verification</h2>
        <p className="text-gray-600 mt-2">
          We've sent a verification code to your email address.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            id="verification-code"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            autoComplete="one-time-code"
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="remember-device"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          />
          <label htmlFor="remember-device" className="ml-2 block text-sm text-gray-700">
            Remember this device for 30 days
          </label>
        </div>
        
        <button
          onClick={handleVerify}
          disabled={loading || !verificationCode}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        
        <div className="text-center">
          <button 
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none disabled:text-gray-400 flex items-center justify-center mx-auto"
          >
            <RefreshCw size={16} className="mr-1" />
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </button>
        </div>
        
        <div className="text-center">
          <button 
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium focus:outline-none"
          >
            Cancel and sign out
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Having trouble? <a href="/auth/recovery" className="text-blue-600 hover:text-blue-800">Recover your account</a>
        </p>
      </div>
    </div>
  );
}
