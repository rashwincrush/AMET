'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle, ArrowLeft, KeyRound, Smartphone } from 'lucide-react';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // Get the current user
    const getCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load security data:', error);
        toast({
          title: 'Error loading security settings',
          description: 'Please try again later.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleAccountDeletion = async () => {
    try {
      // This would be the actual account deletion logic
      // For demo, just show a toast
      toast({
        title: 'Account deletion',
        description: 'This feature is disabled in the demo.',
        variant: 'destructive',
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: 'Error deleting account',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      toast({
        title: 'Error logging out',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-6xl py-6">
        <div className="mb-8 flex items-center">
          <Link href="/settings" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader title="Security Settings" description="Manage your account security and privacy" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="authentication" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your basic account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium">Email Address</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {user?.email || 'Not available'}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Account Created</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'Not available'}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-medium mb-2">Notification Preferences</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Security Alerts</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive alerts about suspicious activity
                      </p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                      aria-label="Toggle security notifications"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => {
                  toast({
                    title: "Settings saved",
                    description: "Your security preferences have been updated."
                  });
                }}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>Device Management</AlertTitle>
              <AlertDescription>
                You are currently logged in from 1 device. Manage your active sessions.
              </AlertDescription>
              <Button variant="outline" size="sm" className="mt-2">
                View Devices
              </Button>
            </Alert>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-4">
            <TwoFactorAuth />

            <Card>
              <CardHeader>
                <CardTitle>Password Management</CardTitle>
                <CardDescription>
                  Securely update your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    It's a good practice to change your password regularly. Your password was last
                    changed on <span className="font-medium text-foreground">January 15, 2023</span>.
                  </p>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Password strength:</span>
                    <Badge>Strong</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/auth/reset-password')}
                >
                  Change Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-500 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>
                  Actions here can't be undone. Proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Account Deletion</AlertTitle>
                  <AlertDescription>
                    Deleting your account will remove all your data and cannot be reversed.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Sign Out From All Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={handleAccountDeletion}
          title="Delete Account"
          description="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
          confirmLabel="Delete Account"
          cancelLabel="Cancel"
          confirmVariant="destructive"
        />
      </div>
    </ProtectedRoute>
  );
}
