'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';
import type { KnowledgeItem } from '@ob-digital-portal/shared';

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const response = await ApiClient.get<KnowledgeItem[]>('/knowledge');

    if (response.success && response.data) {
      setItems(response.data);
    }

    setLoading(false);
  };

  const filteredItems = items.filter((item) => {
    if (typeFilter && item.type !== typeFilter) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const types = Array.from(new Set(items.map((i) => i.type)));
  const categories = Array.from(new Set(items.map((i) => i.category)));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sop': return 'badge-info';
      case 'runbook': return 'badge-warning';
      case 'collateral': return 'badge-success';
      case 'documentation': return 'badge-info';
      case 'guide': return 'badge-success';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading knowledge base...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Area</h1>
          <p className="mt-2 text-gray-600">SOPs, runbooks, collaterals, and documentation</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
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
          </div>
        </div>

        {/* Knowledge Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <span className={`badge ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{item.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{item.author}</span>
                <span>{item.viewCount} views</span>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Updated: {new Date(item.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No knowledge items found matching your filters
          </div>
        )}

        {/* Knowledge Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${getTypeColor(selectedItem.type)}`}>
                      {selectedItem.type}
                    </span>
                    <span className="badge badge-info">{selectedItem.category}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags.map((tag) => (
                    <span key={tag} className="badge badge-info">
                      {tag}
                    </span>
                  ))}
                </div>

                {selectedItem.markdownContent && (
                  <div className="prose max-w-none border-t border-gray-200 pt-4">
                    <ReactMarkdown>{selectedItem.markdownContent}</ReactMarkdown>
                  </div>
                )}

                {selectedItem.contentUrl && (
                  <div className="border-t border-gray-200 pt-4">
                    <a
                      href={selectedItem.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      View External Document →
                    </a>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between text-sm text-gray-600">
                  <span>Author: {selectedItem.author}</span>
                  <span>Last updated: {new Date(selectedItem.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
