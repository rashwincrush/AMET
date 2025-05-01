'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type JobAlert = {
  id: string;
  job_type: string[];
  keywords: string[];
  location: string;
  min_salary: number;
  max_salary: number;
  notification_frequency: 'daily' | 'weekly' | 'instant';
  is_active: boolean;
};

export default function JobAlertsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobAlerts();
  }, []);

  async function loadJobAlerts() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      setError('Failed to load job alerts');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAlertStatus(alertId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;
      await loadJobAlerts();
    } catch (err) {
      setError('Failed to update alert status');
      console.error('Error:', err);
    }
  }

  async function deleteAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from('job_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      await loadJobAlerts();
    } catch (err) {
      setError('Failed to delete alert');
      console.error('Error:', err);
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Job Alerts</h1>
          <Button
            onClick={() => router.push('/jobs/alerts/create')}
            variant="default"
          >
            Create New Alert
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No job alerts found</p>
            <Button
              onClick={() => router.push('/jobs/alerts/create')}
              variant="outline"
              className="mt-4"
            >
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {alert.keywords.join(', ')}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>Location: {alert.location}</p>
                      <p>Job Types: {alert.job_type.join(', ')}</p>
                      <p>
                        Salary Range: ${alert.min_salary.toLocaleString()} - $
                        {alert.max_salary.toLocaleString()}
                      </p>
                      <p>Frequency: {alert.notification_frequency}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={alert.is_active ? 'default' : 'secondary'}
                      onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                    >
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}