'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import type { PortfolioService, TechCredential } from '@ob-digital-portal/shared';

export default function PortfolioPage() {
  const [services, setServices] = useState<PortfolioService[]>([]);
  const [credentials, setCredentials] = useState<TechCredential[]>([]);
  const [filteredServices, setFilteredServices] = useState<PortfolioService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [selectedService, setSelectedService] = useState<PortfolioService | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [servicesRes, credentialsRes] = await Promise.all([
        ApiClient.get<PortfolioService[]>('/portfolio/services'),
        ApiClient.get<TechCredential[]>('/portfolio/credentials'),
      ]);

      if (servicesRes.success && servicesRes.data) {
        setServices(servicesRes.data);
        setFilteredServices(servicesRes.data);
      }

      if (credentialsRes.success && credentialsRes.data) {
        setCredentials(credentialsRes.data);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = services;

    if (categoryFilter) {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    if (regionFilter) {
      filtered = filtered.filter((s) => s.region.includes(regionFilter));
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          s.techStack.some((tech) => tech.toLowerCase().includes(search))
      );
    }

    setFilteredServices(filtered);
  }, [searchTerm, categoryFilter, regionFilter, services]);

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const regions = Array.from(new Set(services.flatMap((s) => s.region)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading portfolio...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Hub</h1>
          <p className="mt-2 text-gray-600">Browse services, use cases, and credentials</p>
        </div>

        {/* Tech Credentials */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tech Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {credentials.map((cred) => (
              <div key={cred.id} className="border border-gray-200 rounded-lg p-4">
                <div className="font-semibold text-gray-900">{cred.technology}</div>
                <div className="text-sm text-gray-600">{cred.certificationLevel}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Valid until: {new Date(cred.validUntil).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                className="input"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedService(service)}>
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <div className="badge badge-info mt-2">{service.category}</div>
              <p className="mt-3 text-sm text-gray-600">{service.description}</p>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700">Tech Stack:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {service.techStack.map((tech) => (
                    <span key={tech} className="badge badge-info">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700">Regions:</div>
                <div className="text-sm text-gray-600 mt-1">{service.region.join(', ')}</div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-600">
                  Partner SPOC: <span className="font-medium">{service.partnerSpoc}</span>
                </div>
              </div>

              {service.caseStudies.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700">
                    {service.caseStudies.length} Case {service.caseStudies.length === 1 ? 'Study' : 'Studies'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No services found matching your filters
          </div>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedService(null)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-600 mt-1">{selectedService.description}</p>
                </div>

                {selectedService.useCases.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Use Cases</h3>
                    <ul className="list-disc list-inside text-gray-600 mt-1">
                      {selectedService.useCases.map((useCase, idx) => (
                        <li key={idx}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedService.caseStudies.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Case Studies</h3>
                    <div className="space-y-3 mt-2">
                      {selectedService.caseStudies.map((cs) => (
                        <div key={cs.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">{cs.title}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {cs.client} • {cs.industry} • {cs.duration}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{cs.summary}</p>
                          <div className="mt-2">
                            <div className="text-sm font-medium text-gray-700">Outcomes:</div>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {cs.outcomes.map((outcome, idx) => (
                                <li key={idx}>{outcome}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedService.collateralUrls.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Collateral</h3>
                    <ul className="list-disc list-inside text-gray-600 mt-1">
                      {selectedService.collateralUrls.map((url, idx) => (
                        <li key={idx}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                            {url.split('/').pop()}
                          </a>
                        </li>
                      ))}
                    </ul>
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
