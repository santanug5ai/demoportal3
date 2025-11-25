'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Skill, Certification } from '@ob-digital-portal/shared';

export default function SkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [skillsRes, certsRes] = await Promise.all([
        ApiClient.get<Skill[]>('/skills/skills'),
        ApiClient.get<Certification[]>('/skills/certifications'),
      ]);

      if (skillsRes.success && skillsRes.data) {
        setSkills(skillsRes.data);
      }

      if (certsRes.success && certsRes.data) {
        setCertifications(certsRes.data);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const handleRefreshRequest = async (type: 'skill' | 'certification', targetId: string) => {
    const result = await ApiClient.post('/skills/refresh-request', { type, targetId });

    if (result.success) {
      alert('Refresh request submitted successfully!');
    } else {
      alert('Failed to submit refresh request: ' + result.error);
    }
  };

  const canRequestRefresh = user?.role === 'sales' || user?.role === 'integration' || user?.role === 'partner';

  const filteredSkills = skills.filter((skill) => {
    if (categoryFilter && skill.category !== categoryFilter) return false;
    if (searchTerm && !skill.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredCerts = certifications.filter((cert) => {
    if (statusFilter && cert.status !== statusFilter) return false;
    if (searchTerm && !cert.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading skills...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills & Certifications</h1>
          <p className="mt-2 text-gray-600">Searchable directory with quarterly refresh tracking</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Category</label>
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cert Status</label>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Directory</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Practitioners
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  {canRequestRefresh && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {skill.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        skill.level === 'expert' ? 'badge-success' :
                        skill.level === 'advanced' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {skill.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.practitioners}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {skill.lastUpdated}
                    </td>
                    {canRequestRefresh && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRefreshRequest('skill', skill.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Request Refresh
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Certifications Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications Directory</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Refresh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Refresh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {canRequestRefresh && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cert.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cert.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cert.holdersCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cert.lastRefreshQuarter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cert.nextRefreshDue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        cert.status === 'active' ? 'badge-success' :
                        cert.status === 'expiring' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    {canRequestRefresh && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRefreshRequest('certification', cert.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Request Refresh
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
