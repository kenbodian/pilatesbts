import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { InstructorClient } from '../types/clientCards';

interface AddClientModalProps {
  instructorId: string;
  onSaved: (client: InstructorClient) => void;
  onClose: () => void;
}

export function AddClientModal({ instructorId, onSaved, onClose }: AddClientModalProps) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    goals: '',
    injuries: '',
    pain_scale: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('instructor_clients')
        .insert({
          created_by: instructorId,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          height: form.height.trim() || null,
          weight: form.weight.trim() || null,
          goals: form.goals.trim() || null,
          injuries: form.injuries.trim() || null,
          pain_scale: form.pain_scale ? parseInt(form.pain_scale, 10) : null,
          notes: form.notes.trim() || null,
        })
        .select()
        .single();

      if (err) throw err;
      if (data) onSaved(data as InstructorClient);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-gray-800">New Client</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">First name *</label>
                <input {...field('first_name')} className={inputClass} placeholder="Alisa" required autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Last name *</label>
                <input {...field('last_name')} className={inputClass} placeholder="Smith" required />
              </div>
            </div>

            {/* Physical */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Height</label>
                <input {...field('height')} className={inputClass} placeholder="5'6&quot;" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Weight</label>
                <input {...field('weight')} className={inputClass} placeholder="140 lbs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Pain (0–10)</label>
                <input
                  type="number" min="0" max="10"
                  {...field('pain_scale')}
                  className={inputClass}
                  placeholder="3"
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Goals</label>
              <textarea
                {...field('goals')}
                className={inputClass + ' resize-none'}
                rows={2}
                placeholder="Core strength, postural alignment, flexibility…"
              />
            </div>

            {/* Injuries */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Injuries / Considerations</label>
              <textarea
                {...field('injuries')}
                className={inputClass + ' resize-none'}
                rows={2}
                placeholder="Low back pain, avoid full flexion…"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea
                {...field('notes')}
                className={inputClass + ' resize-none'}
                rows={2}
                placeholder="Any additional observations…"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-gray-100 flex space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding…' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
