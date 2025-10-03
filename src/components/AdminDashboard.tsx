import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, LogOut, Waves, Download, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  user: any;
}

interface Waiver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  occupation: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  medical_conditions: string | null;
  previous_injuries: string | null;
  current_pain: string | null;
  pregnancy_status: string | null;
  fitness_level: string;
  exercise_history: string | null;
  pilates_experience: string | null;
  fitness_goals: string;
  preferred_schedule: string | null;
  how_did_you_hear: string | null;
  additional_notes: string | null;
  signed_at: string;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [selectedWaiver, setSelectedWaiver] = useState<Waiver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('waivers')
        .select('*')
        .order('signed_at', { ascending: false });

      if (error) throw error;
      setWaivers(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Date of Birth', 'Occupation',
      'Emergency Contact', 'Emergency Phone', 'Emergency Relationship',
      'Previous Injuries', 'Current Pain', 'Medical Conditions',
      'Pregnancy Status', 'Fitness Level', 'Exercise History',
      'Pilates Experience', 'Fitness Goals', 'Preferred Schedule',
      'How Did You Hear', 'Additional Notes', 'Signed At'
    ];

    const rows = waivers.map(waiver => [
      waiver.full_name, waiver.email, waiver.phone, waiver.date_of_birth, waiver.occupation,
      waiver.emergency_contact_name, waiver.emergency_contact_phone, waiver.emergency_contact_relationship,
      waiver.previous_injuries || '', waiver.current_pain || '', waiver.medical_conditions || '',
      waiver.pregnancy_status || '', waiver.fitness_level, waiver.exercise_history || '',
      waiver.pilates_experience || '', waiver.fitness_goals, waiver.preferred_schedule || '',
      waiver.how_did_you_hear || '', waiver.additional_notes || '', formatDate(waiver.signed_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-information-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-light text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Client Forms</p>
                <p className="text-3xl font-light text-gray-800">{waivers.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Members</p>
                <p className="text-3xl font-light text-gray-800">{new Set(waivers.map(f => f.email)).size}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-800">Client Information & Waivers</h3>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">View and manage all client forms</p>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export CSV</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {waivers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No client forms submitted yet</p>
                ) : (
                  waivers.map((waiver) => (
                    <div
                      key={waiver.id}
                      onClick={() => setSelectedWaiver(waiver)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{waiver.full_name}</h4>
                          <p className="text-sm text-gray-600">{waiver.email}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(waiver.signed_at)}
                            </span>
                            <span>Fitness Level: {waiver.fitness_level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">Click to view details</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedWaiver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-light text-gray-800">Client Information</h2>
              <button
                onClick={() => setSelectedWaiver(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedWaiver.full_name}</div>
                  <div><span className="font-medium">Email:</span> {selectedWaiver.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedWaiver.phone}</div>
                  <div><span className="font-medium">Date of Birth:</span> {selectedWaiver.date_of_birth}</div>
                  <div className="md:col-span-2"><span className="font-medium">Occupation:</span> {selectedWaiver.occupation}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Emergency Contact</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedWaiver.emergency_contact_name}</div>
                  <div><span className="font-medium">Phone:</span> {selectedWaiver.emergency_contact_phone}</div>
                  <div><span className="font-medium">Relationship:</span> {selectedWaiver.emergency_contact_relationship}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Information</h3>
                <div className="space-y-3 text-sm">
                  {selectedWaiver.medical_conditions && (
                    <div><span className="font-medium">Medical Conditions:</span><br/>{selectedWaiver.medical_conditions}</div>
                  )}
                  {selectedWaiver.previous_injuries && (
                    <div><span className="font-medium">Previous Injuries:</span><br/>{selectedWaiver.previous_injuries}</div>
                  )}
                  {selectedWaiver.current_pain && (
                    <div><span className="font-medium">Current Pain:</span><br/>{selectedWaiver.current_pain}</div>
                  )}
                  {selectedWaiver.pregnancy_status && (
                    <div><span className="font-medium">Pregnancy Status:</span> {selectedWaiver.pregnancy_status}</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Fitness Background</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium">Fitness Level:</span> {selectedWaiver.fitness_level}</div>
                  {selectedWaiver.exercise_history && (
                    <div><span className="font-medium">Exercise History:</span><br/>{selectedWaiver.exercise_history}</div>
                  )}
                  {selectedWaiver.pilates_experience && (
                    <div><span className="font-medium">Pilates Experience:</span><br/>{selectedWaiver.pilates_experience}</div>
                  )}
                  <div><span className="font-medium">Fitness Goals:</span><br/>{selectedWaiver.fitness_goals}</div>
                </div>
              </div>

              {(selectedWaiver.preferred_schedule || selectedWaiver.how_did_you_hear || selectedWaiver.additional_notes) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
                  <div className="space-y-3 text-sm">
                    {selectedWaiver.preferred_schedule && (
                      <div><span className="font-medium">Preferred Schedule:</span> {selectedWaiver.preferred_schedule}</div>
                    )}
                    {selectedWaiver.how_did_you_hear && (
                      <div><span className="font-medium">How They Heard About Us:</span> {selectedWaiver.how_did_you_hear}</div>
                    )}
                    {selectedWaiver.additional_notes && (
                      <div><span className="font-medium">Additional Notes:</span><br/>{selectedWaiver.additional_notes}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 border-t pt-4">
                Submitted: {formatDate(selectedWaiver.signed_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
