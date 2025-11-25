'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardMetrics, IncubationMetrics } from '@ob-digital-portal/shared';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projectMetrics, setProjectMetrics] = useState<DashboardMetrics | null>(null);
  const [incubationMetrics, setIncubationMetrics] = useState<IncubationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const [projectsRes, incubationsRes] = await Promise.all([
        ApiClient.get<DashboardMetrics>('/projects/dashboard'),
        ApiClient.get<IncubationMetrics>('/incubations/metrics'),
      ]);

      if (projectsRes.success && projectsRes.data) {
        setProjectMetrics(projectsRes.data);
      }

      if (incubationsRes.success && incubationsRes.data) {
        setIncubationMetrics(incubationsRes.data);
      }

      setLoading(false);
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* Project Metrics */}
        {projectMetrics && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="text-sm text-gray-600">Total Projects</div>
                <div className="text-3xl font-bold text-primary-600 mt-2">
                  {projectMetrics.totalProjects}
                </div>
              </div>

              <div className="card">
                <div className="text-sm text-gray-600">Active Projects</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {projectMetrics.activeProjects}
                </div>
              </div>

              <div className="card">
                <div className="text-sm text-gray-600">Average Uptime</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {projectMetrics.averageUptime.toFixed(2)}%
                </div>
              </div>

              <div className="card">
                <div className="text-sm text-gray-600">Avg First-Time Acceptance</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {(projectMetrics.averageFirstTimeAcceptance * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Projects by Region</h3>
                <div className="space-y-2">
                  {Object.entries(projectMetrics.projectsByRegion).map(([region, count]) => (
                    <div key={region} className="flex justify-between">
                      <span className="text-gray-600">{region}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Projects by Status</h3>
                <div className="space-y-2">
                  {Object.entries(projectMetrics.projectsByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incubation Metrics */}
        {incubationMetrics && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Incubation Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-3xl font-bold text-primary-600 mt-2">
                  {incubationMetrics.totalRequests}
                </div>
              </div>

              <div className="card">
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {(incubationMetrics.conversionRate * 100).toFixed(0)}%
                </div>
              </div>

              <div className="card">
                <div className="text-sm text-gray-600">Avg Time to Ready</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {incubationMetrics.averageTimeToReady.toFixed(0)} days
                </div>
              </div>
            </div>

            <div className="card mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(incubationMetrics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/engagements/new" className="btn-primary text-center">
              New Engagement Request
            </a>
            <a href="/incubations/new" className="btn-primary text-center">
              Submit Incubation
            </a>
            <a href="/projects/export/csv" className="btn-secondary text-center">
              Export Projects
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
