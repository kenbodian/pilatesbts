import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, LogOut, Waves, Download, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ClientRoster } from './ClientRoster';
import { ClientCard } from './ClientCard';
import { AddClientModal } from './AddClientModal';
import type { InstructorClient } from '../types/clientCards';

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

type Tab = 'cards' | 'waivers';

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('cards');

  // ── Client Cards state ──
  const [selectedClient, setSelectedClient] = useState<InstructorClient | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [rosterKey, setRosterKey] = useState(0); // force re-mount roster after add

  // ── Waivers state ──
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [selectedWaiver, setSelectedWaiver] = useState<Waiver | null>(null);
  const [loadingWaivers, setLoadingWaivers] = useState(false);
  const [waiversLoaded, setWaiversLoaded] = useState(false);

  // Lazy-load waivers only when that tab is opened
  useEffect(() => {
    if (activeTab === 'waivers' && !waiversLoaded) {
      loadWaivers();
    }
  }, [activeTab]);

  const loadWaivers = async () => {
    setLoadingWaivers(true);
    try {
      const { data, error } = await supabase
        .from('waivers')
        .select('*')
        .order('signed_at', { ascending: false });
      if (error) throw error;
      setWaivers(data || []);
      setWaiversLoaded(true);
    } catch (err) {
      console.error('Error loading waivers:', err);
    } finally {
      setLoadingWaivers(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Date of Birth', 'Occupation',
      'Emergency Contact', 'Emergency Phone', 'Emergency Relationship',
      'Previous Injuries', 'Current Pain', 'Medical Conditions',
      'Pregnancy Status', 'Fitness Level', 'Exercise History',
      'Pilates Experience', 'Fitness Goals', 'Preferred Schedule',
      'How Did You Hear', 'Additional Notes', 'Signed At',
    ];
    const rows = waivers.map(w => [
      w.full_name, w.email, w.phone, w.date_of_birth, w.occupation,
      w.emergency_contact_name, w.emergency_contact_phone, w.emergency_contact_relationship,
      w.previous_injuries || '', w.current_pain || '', w.medical_conditions || '',
      w.pregnancy_status || '', w.fitness_level, w.exercise_history || '',
      w.pilates_experience || '', w.fitness_goals, w.preferred_schedule || '',
      w.how_did_you_hear || '', w.additional_notes || '', formatDate(w.signed_at),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-information-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-light text-gray-800 hidden sm:block">Pilates BTS Studio</span>
          </div>

          {/* Tab nav */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 space-x-1">
            <button
              onClick={() => { setActiveTab('cards'); setSelectedClient(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cards'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Client Cards</span>
            </button>
            <button
              onClick={() => setActiveTab('waivers')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'waivers'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Waivers</span>
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* ── CLIENT CARDS TAB ── */}
        {activeTab === 'cards' && (
          <>
            {selectedClient ? (
              <ClientCard
                client={selectedClient}
                onBack={() => setSelectedClient(null)}
              />
            ) : (
              <ClientRoster
                key={rosterKey}
                onSelectClient={setSelectedClient}
                onAddClient={() => setShowAddClient(true)}
              />
            )}

            {showAddClient && (
              <AddClientModal
                instructorId={user?.id}
                onSaved={newClient => {
                  setShowAddClient(false);
                  setRosterKey(k => k + 1); // refresh roster
                  setSelectedClient(newClient); // jump straight to their card
                }}
                onClose={() => setShowAddClient(false)}
              />
            )}
          </>
        )}

        {/* ── WAIVERS TAB ── */}
        {activeTab === 'waivers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Client Waivers</h3>
                  {waiversLoaded && (
                    <span className="text-sm text-gray-400">({waivers.length})</span>
                  )}
                </div>
                {waivers.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {loadingWaivers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : waivers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No client waivers submitted yet</p>
              ) : (
                <div className="space-y-3">
                  {waivers.map(waiver => (
                    <div
                      key={waiver.id}
                      onClick={() => setSelectedWaiver(waiver)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{waiver.full_name}</h4>
                          <p className="text-sm text-gray-600">{waiver.email}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              {formatDate(waiver.signed_at)}
                            </span>
                            <span>Level: {waiver.fitness_level}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">View →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Waiver Detail Modal ── */}
      {selectedWaiver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-light text-gray-800">Client Information</h2>
              <button onClick={() => setSelectedWaiver(null)} className="p-2 text-gray-400 hover:text-gray-600">
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
                  {selectedWaiver.medical_conditions && <div><span className="font-medium">Medical Conditions:</span><br />{selectedWaiver.medical_conditions}</div>}
                  {selectedWaiver.previous_injuries && <div><span className="font-medium">Previous Injuries:</span><br />{selectedWaiver.previous_injuries}</div>}
                  {selectedWaiver.current_pain && <div><span className="font-medium">Current Pain:</span><br />{selectedWaiver.current_pain}</div>}
                  {selectedWaiver.pregnancy_status && <div><span className="font-medium">Pregnancy Status:</span> {selectedWaiver.pregnancy_status}</div>}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Fitness Background</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium">Fitness Level:</span> {selectedWaiver.fitness_level}</div>
                  {selectedWaiver.exercise_history && <div><span className="font-medium">Exercise History:</span><br />{selectedWaiver.exercise_history}</div>}
                  {selectedWaiver.pilates_experience && <div><span className="font-medium">Pilates Experience:</span><br />{selectedWaiver.pilates_experience}</div>}
                  <div><span className="font-medium">Fitness Goals:</span><br />{selectedWaiver.fitness_goals}</div>
                </div>
              </div>
              {(selectedWaiver.preferred_schedule || selectedWaiver.how_did_you_hear || selectedWaiver.additional_notes) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
                  <div className="space-y-3 text-sm">
                    {selectedWaiver.preferred_schedule && <div><span className="font-medium">Preferred Schedule:</span> {selectedWaiver.preferred_schedule}</div>}
                    {selectedWaiver.how_did_you_hear && <div><span className="font-medium">How They Heard About Us:</span> {selectedWaiver.how_did_you_hear}</div>}
                    {selectedWaiver.additional_notes && <div><span className="font-medium">Additional Notes:</span><br />{selectedWaiver.additional_notes}</div>}
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
