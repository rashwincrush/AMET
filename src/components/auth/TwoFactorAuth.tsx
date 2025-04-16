'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { QRCodeSVG } from 'qrcode.react';

export default function TwoFactorAuth() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  useEffect(() => {
    check2FAStatus();
  }, [user]);

  const check2FAStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (error) throw error;
      
      setIs2FAEnabled(data.currentLevel === 'aal2');
    } catch (error: any) {
      console.error('Error checking 2FA status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Generate new TOTP secret
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      
      // Get the QR code and secret
      const { data: qrData, error: qrError } = await supabase.auth.mfa.challenge({
        factorId: data.id
      });
      
      if (qrError) throw qrError;
      
      setQrCode(qrData.qr_code);
      setSecret(data.id);
      setChallengeId(qrData.id);
      setSuccess('2FA setup initiated. Please scan the QR code with your authenticator app.');
    } catch (error: any) {
      console.error('Error setting up 2FA:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!user || !secret || !challengeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Verify the TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: secret,
        challengeId: challengeId,
        code: verificationCode
      });
      
      if (error) throw error;
      
      // Generate recovery codes
      const recoveryCodes = generateRecoveryCodes();
      setRecoveryCodes(recoveryCodes);
      
      // Store recovery codes in the database
      const { error: recoveryError } = await supabase
        .from('user_recovery_codes')
        .insert({
          user_id: user.id,
          codes: recoveryCodes
        });
      
      if (recoveryError) throw recoveryError;
      
      setIs2FAEnabled(true);
      setSuccess('2FA has been successfully enabled. Please save your recovery codes in a secure place.');
    } catch (error: any) {
      console.error('Error verifying 2FA:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!user || !secret) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: secret
      });
      
      if (error) throw error;
      
      // Remove recovery codes from the database
      const { error: recoveryError } = await supabase
        .from('user_recovery_codes')
        .delete()
        .eq('user_id', user.id);
      
      if (recoveryError) throw recoveryError;
      
      setIs2FAEnabled(false);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      setRecoveryCodes([]);
      setSuccess('2FA has been successfully disabled.');
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate random recovery codes
  const generateRecoveryCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enhance your account security by enabling two-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {is2FAEnabled ? (
              <div className="space-y-4">
                <p>Two-factor authentication is currently enabled for your account.</p>
                <Button 
                  variant="destructive" 
                  onClick={disable2FA} 
                  disabled={loading}
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QRCodeSVG value={qrCode} size={200} />
                </div>
                <p className="text-sm text-center">
                  Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator).
                </p>
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter the 6-digit code from your authenticator app"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={verify2FA} 
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={setup2FA} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up...' : 'Set Up 2FA'}
              </Button>
            )}
            
            {recoveryCodes.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Recovery Codes</h3>
                <p className="text-sm text-muted-foreground">
                  Save these recovery codes in a secure place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => router.push('/profile')}
              className="w-full"
            >
              Back to Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}