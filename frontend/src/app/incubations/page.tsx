'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import type { IncubationRequest } from '@ob-digital-portal/shared';

export default function IncubationsPage() {
  const [incubations, setIncubations] = useState<IncubationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncubation, setSelectedIncubation] = useState<IncubationRequest | null>(null);

  useEffect(() => {
    fetchIncubations();
  }, []);

  const fetchIncubations = async () => {
    const response = await ApiClient.get<IncubationRequest[]>('/incubations');

    if (response.success && response.data) {
      setIncubations(response.data);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'badge-info';
      case 'design': return 'badge-warning';
      case 'poc': return 'badge-warning';
      case 'offerize': return 'badge-info';
      case 'ready': return 'badge-success';
      case 'rejected': return 'badge-error';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading incubations...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incubation Tracker</h1>
          <p className="mt-2 text-gray-600">Track innovation projects from idea to market-ready</p>
        </div>

        {/* Incubations Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incubations.map((incub) => (
                  <tr key={incub.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {incub.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incub.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(incub.status)}`}>
                        {incub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incub.actualCost ? `$${incub.actualCost.toLocaleString()}` : `Est. $${incub.estimatedCost?.toLocaleString() || 'N/A'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedIncubation(incub)}
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

          {incubations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No incubation requests found
            </div>
          )}
        </div>

        {/* Incubation Detail Modal */}
        {selectedIncubation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedIncubation(null)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedIncubation.name}</h2>
                <button onClick={() => setSelectedIncubation(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Status</div>
                  <span className={`badge ${getStatusColor(selectedIncubation.status)}`}>
                    {selectedIncubation.status}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Description</div>
                  <p className="text-sm text-gray-600 mt-1">{selectedIncubation.description}</p>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Business Value</div>
                  <p className="text-sm text-gray-600 mt-1">{selectedIncubation.businessValue}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Region</div>
                    <div className="text-sm text-gray-900">{selectedIncubation.region}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Submitted By</div>
                    <div className="text-sm text-gray-900">{selectedIncubation.submittedBy}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Tech Stack</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedIncubation.techStack.map((tech) => (
                      <span key={tech} className="badge badge-info">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedIncubation.labAssets.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Lab Assets</div>
                    <div className="text-sm text-gray-900 mt-1">{selectedIncubation.labAssets.join(', ')}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Estimated Cost</div>
                    <div className="text-sm text-gray-900">${selectedIncubation.estimatedCost?.toLocaleString() || 'N/A'}</div>
                  </div>
                  {selectedIncubation.actualCost && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Actual Cost</div>
                      <div className="text-sm text-gray-900">${selectedIncubation.actualCost.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Timeline</div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-700">Requested:</span>
                      <span className="text-gray-900 ml-2">{new Date(selectedIncubation.timeline.requestedDate).toLocaleDateString()}</span>
                    </div>
                    {selectedIncubation.timeline.designStartDate && (
                      <div className="text-sm">
                        <span className="text-gray-700">Design Started:</span>
                        <span className="text-gray-900 ml-2">{new Date(selectedIncubation.timeline.designStartDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedIncubation.timeline.pocStartDate && (
                      <div className="text-sm">
                        <span className="text-gray-700">PoC Started:</span>
                        <span className="text-gray-900 ml-2">{new Date(selectedIncubation.timeline.pocStartDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedIncubation.timeline.offerizeDate && (
                      <div className="text-sm">
                        <span className="text-gray-700">Offerized:</span>
                        <span className="text-gray-900 ml-2">{new Date(selectedIncubation.timeline.offerizeDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedIncubation.timeline.readyDate && (
                      <div className="text-sm">
                        <span className="text-gray-700">Ready:</span>
                        <span className="text-gray-900 ml-2">{new Date(selectedIncubation.timeline.readyDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedIncubation.statusHistory.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Status History</div>
                    <div className="space-y-2">
                      {selectedIncubation.statusHistory.map((change, idx) => (
                        <div key={idx} className="text-sm border-l-2 border-gray-300 pl-3 py-1">
                          <div className="text-gray-900">
                            <span className="capitalize">{change.from}</span> → <span className="capitalize">{change.to}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(change.timestamp).toLocaleString()} by {change.changedBy}
                          </div>
                          {change.notes && (
                            <div className="text-gray-600 mt-1">{change.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
