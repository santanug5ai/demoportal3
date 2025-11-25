'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ApiClient } from '@/lib/api';

const REGIONS = ['North America', 'Europe', 'APAC', 'LATAM'];
const SKILLS = ['AWS', 'Azure', 'Cloud Architecture', 'Kubernetes', 'Python', 'Machine Learning', 'TensorFlow', 'DevOps', 'Security', 'Terraform'];

export default function NewEngagementPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    requestType: 'consultant' as 'sme' | 'consultant' | 'professional',
    title: '',
    description: '',
    requiredSkills: [] as string[],
    region: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    estimatedHours: undefined as number | undefined,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && (!formData.requestType || !formData.title || !formData.description)) {
      alert('Please fill in all required fields');
      return;
    }
    if (step === 2 && (formData.requiredSkills.length === 0 || !formData.region)) {
      alert('Please select at least one skill and a region');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.priority) {
      alert('Please select a priority');
      return;
    }

    setSubmitting(true);

    const response = await ApiClient.post('/engagements', formData);

    if (response.success) {
      alert('Engagement request submitted successfully! Auto-routing in progress...');
      router.push('/engagements');
    } else {
      alert('Failed to submit engagement: ' + response.error);
      setSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.includes(skill)
        ? formData.requiredSkills.filter((s) => s !== skill)
        : [...formData.requiredSkills, skill],
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Engagement Request</h1>
          <p className="mt-2 text-gray-600">Multi-step form to request SME/consultant support</p>
        </div>

        {/* Progress Indicator */}
        <div className="card">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s === step
                      ? 'bg-primary-600 text-white'
                      : s < step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Skills & Region</span>
            <span>Priority & Review</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Step 1: Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Type <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value as any })}
              >
                <option value="sme">SME (Subject Matter Expert)</option>
                <option value="consultant">Consultant</option>
                <option value="professional">Professional Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Cloud Migration Assessment"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="Describe the engagement requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills & Region */}
        {step === 2 && (
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Step 2: Skills & Region</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SKILLS.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiredSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              >
                <option value="">Select a region</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours (Optional)
              </label>
              <input
                type="number"
                className="input"
                placeholder="e.g., 40"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Priority & Review */}
        {step === 3 && (
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Step 3: Priority & Review</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="low">Low (SLA: 1 week)</option>
                <option value="medium">Medium (SLA: 3 days)</option>
                <option value="high">High (SLA: 1 day)</option>
                <option value="critical">Critical (SLA: 4 hours)</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Review Your Request</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-700">Request Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.requestType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Title</dt>
                  <dd className="text-sm text-gray-900">{formData.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Description</dt>
                  <dd className="text-sm text-gray-900">{formData.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Required Skills</dt>
                  <dd className="text-sm text-gray-900">{formData.requiredSkills.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Region</dt>
                  <dd className="text-sm text-gray-900">{formData.region}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Priority</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.priority}</dd>
                </div>
                {formData.estimatedHours && (
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Estimated Hours</dt>
                    <dd className="text-sm text-gray-900">{formData.estimatedHours}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
