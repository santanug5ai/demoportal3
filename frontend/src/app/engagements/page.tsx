'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { EngagementRequest } from '@ob-digital-portal/shared';

export default function EngagementsPage() {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState<EngagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEngagement, setSelectedEngagement] = useState<EngagementRequest | null>(null);

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    const response = await ApiClient.get<EngagementRequest[]>('/engagements');

    if (response.success && response.data) {
      setEngagements(response.data);
    }

    setLoading(false);
  };

  const canCreate = user?.role === 'sales' || user?.role === 'integration' || user?.role === 'partner';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'badge-info';
      case 'routing': return 'badge-warning';
      case 'assigned': return 'badge-info';
      case 'in-progress': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading engagements...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pre-Sales Engagements</h1>
            <p className="mt-2 text-gray-600">Request and track SME/consultant support</p>
          </div>
          {canCreate && (
            <Link href="/engagements/new" className="btn-primary">
              New Engagement Request
            </Link>
          )}
        </div>

        {/* Engagements Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned SPOC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {engagements.map((eng) => (
                  <tr key={eng.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {eng.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eng.requestType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eng.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getPriorityColor(eng.priority)}`}>
                        {eng.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(eng.status)}`}>
                        {eng.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eng.assignedSpoc || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(eng.slaDeadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedEngagement(eng)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {engagements.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No engagement requests found
            </div>
          )}
        </div>

        {/* Engagement Detail Modal */}
        {selectedEngagement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEngagement(null)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEngagement.title}</h2>
                <button onClick={() => setSelectedEngagement(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Type</div>
                    <div className="text-sm text-gray-900 capitalize">{selectedEngagement.requestType}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Priority</div>
                    <div className={`text-sm font-medium ${getPriorityColor(selectedEngagement.priority)}`}>
                      {selectedEngagement.priority}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Status</div>
                    <span className={`badge ${getStatusColor(selectedEngagement.status)}`}>
                      {selectedEngagement.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Region</div>
                    <div className="text-sm text-gray-900">{selectedEngagement.region}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Description</div>
                  <p className="text-sm text-gray-600 mt-1">{selectedEngagement.description}</p>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Required Skills</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEngagement.requiredSkills.map((skill) => (
                      <span key={skill} className="badge badge-info">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedEngagement.assignedSpoc && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Assigned SPOC</div>
                    <div className="text-sm text-gray-900">{selectedEngagement.assignedSpoc}</div>
                    {selectedEngagement.assignedAt && (
                      <div className="text-xs text-gray-500">
                        Assigned on {new Date(selectedEngagement.assignedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700">Audit Trail</div>
                  <div className="mt-2 space-y-2">
                    {selectedEngagement.auditTrail.map((entry, idx) => (
                      <div key={idx} className="text-sm border-l-2 border-gray-300 pl-3 py-1">
                        <div className="text-gray-900 font-medium capitalize">{entry.action}</div>
                        <div className="text-gray-600">{entry.details}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()} by {entry.user}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
