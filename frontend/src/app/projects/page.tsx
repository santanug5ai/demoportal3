'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import type { Project } from '@ob-digital-portal/shared';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const response = await ApiClient.get<Project[]>('/projects');

    if (response.success && response.data) {
      setProjects(response.data);
    }

    setLoading(false);
  };

  const handleExportCSV = () => {
    window.open('http://localhost:3001/api/projects/export/csv', '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'badge-info';
      case 'active': return 'badge-success';
      case 'on-hold': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading projects...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects & Reports</h1>
            <p className="mt-2 text-gray-600">Dashboard with SLA/KPI metrics and reporting</p>
          </div>
          <button onClick={handleExportCSV} className="btn-secondary">
            Export to CSV
          </button>
        </div>

        {/* Projects Table */}
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incident Resp (hrs)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First-Time Accept
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change Failure Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.kpis.uptimePercent.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.kpis.incidentResponseTimeHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(project.kpis.firstTimeAcceptanceRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(project.kpis.changeFailureRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedProject(project)}
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

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProject(null)}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                  <p className="text-gray-600">{selectedProject.client}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Region</div>
                    <div className="text-sm text-gray-900">{selectedProject.region}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Status</div>
                    <span className={`badge ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Start Date</div>
                    <div className="text-sm text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Project Manager</div>
                    <div className="text-sm text-gray-900">{selectedProject.projectManager}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Performance Indicators</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card">
                      <div className="text-xs text-gray-600">Uptime %</div>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        {selectedProject.kpis.uptimePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs text-gray-600">Incident Response (hrs)</div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {selectedProject.kpis.incidentResponseTimeHours.toFixed(1)}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs text-gray-600">ROT</div>
                      <div className="text-2xl font-bold text-purple-600 mt-1">
                        {selectedProject.kpis.rot.toFixed(2)}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs text-gray-600">First-Time Acceptance</div>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        {(selectedProject.kpis.firstTimeAcceptanceRate * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs text-gray-600">Change Failure Rate</div>
                      <div className="text-2xl font-bold text-orange-600 mt-1">
                        {(selectedProject.kpis.changeFailureRate * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs text-gray-600">Deployment Frequency</div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {selectedProject.kpis.deploymentFrequency}/mo
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs text-gray-600">MTTR (hrs)</div>
                      <div className="text-2xl font-bold text-purple-600 mt-1">
                        {selectedProject.kpis.meanTimeToRecovery.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProject.reports.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Reports</h3>
                    <div className="space-y-3">
                      {selectedProject.reports.map((report) => (
                        <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{report.title}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                {report.reportType} • {report.period} • Generated by {report.generatedBy}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.generatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{report.summary}</p>
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
