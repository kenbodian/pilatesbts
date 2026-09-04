import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Calendar, ClipboardList, CreditCard, Download, FileText, Globe, LogOut, MoreHorizontal, X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ClientRoster } from './ClientRoster';
import { ClientCard } from './ClientCard';
import { AddClientModal } from './AddClientModal';
import { DueForReview } from './DueForReview';
import { Wordmark } from './Wordmark';
import type { InstructorClient } from '../types/clientCards';
import type { User } from '@supabase/supabase-js';

interface AdminDashboardProps {
  user: User;
  /** Switch to the member-facing site (studio info, services, contact). */
  onViewSite?: () => void;
  /** Open the client intake form in read-only preview mode. */
  onViewIntakeForm?: () => void;
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

type Tab = 'cards' | 'review' | 'waivers';

const TABS: Array<{ key: Tab; label: string; icon: typeof CreditCard }> = [
  { key: 'cards', label: 'Clients', icon: CreditCard },
  { key: 'review', label: 'Review', icon: AlertTriangle },
  { key: 'waivers', label: 'Waivers', icon: FileText },
];

export function AdminDashboard({ user, onViewSite, onViewIntakeForm }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('cards');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Close the actions menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

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

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'cards') setSelectedClient(null);
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

  const tabButton = (tab: Tab, layout: 'bar' | 'bottom') => {
    const { label, icon: Icon } = TABS.find(t => t.key === tab)!;
    const active = activeTab === tab;
    if (layout === 'bottom') {
      return (
        <button
          key={tab}
          onClick={() => selectTab(tab)}
          aria-current={active ? 'page' : undefined}
          className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
            active ? 'text-sea' : 'text-ink-3 hover:text-ink'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </button>
      );
    }
    return (
      <button
        key={tab}
        onClick={() => selectTab(tab)}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
          active ? 'bg-white text-sea shadow-sm' : 'text-ink-2 hover:text-ink'
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-foam pb-20 sm:pb-0">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-work items-center justify-between gap-3 px-4 py-3">
          <Wordmark tag="Admin" />

          {/* Tabs live in the bar from the tablet breakpoint up; below that, in the bottom bar */}
          <nav className="hidden items-center gap-1 rounded bg-sand p-1 sm:flex" aria-label="Admin sections">
            {TABS.map(t => tabButton(t.key, 'bar'))}
          </nav>

          {/* Everything that is not a section lives under one menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More actions"
              className="btn-quiet text-ink-2 hover:text-ink"
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              <span className="hidden md:inline">More</span>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-card"
              >
                {onViewSite && (
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onViewSite(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink hover:bg-sand">
                    <Globe className="h-4 w-4 text-sea" aria-hidden="true" />
                    View member site
                  </button>
                )}
                {onViewIntakeForm && (
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onViewIntakeForm(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink hover:bg-sand">
                    <ClipboardList className="h-4 w-4 text-sea" aria-hidden="true" />
                    Preview intake form
                  </button>
                )}
                <div className="my-1 border-t border-line" role="separator" />
                <button role="menuitem" onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-2 hover:bg-sand hover:text-ink">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-work px-4 py-6">

        {/* ── CLIENTS TAB ── */}
        {activeTab === 'cards' && (
          <>
            {selectedClient ? (
              <ClientCard
                client={selectedClient}
                instructorId={user?.id}
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

        {/* ── DUE FOR REVIEW TAB ── */}
        {activeTab === 'review' && (
          <section>
            <div className="mb-5 border-b border-line pb-3">
              <p className="eyebrow">Not practiced in four weeks</p>
              <h2 className="mt-1 text-2xl">Due for review</h2>
            </div>
            <DueForReview
              onSelectClient={client => {
                setSelectedClient(client);
                setActiveTab('cards');
              }}
            />
          </section>
        )}

        {/* ── WAIVERS TAB ── */}
        {activeTab === 'waivers' && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-3 border-b border-line pb-3">
              <div>
                <p className="eyebrow">Intake forms</p>
                <h2 className="mt-1 text-2xl">
                  Waivers
                  {waiversLoaded && <span className="ml-2 font-sans text-base text-ink-3">{waivers.length}</span>}
                </h2>
              </div>
              {waivers.length > 0 && (
                <button onClick={exportToCSV} className="btn-secondary">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {loadingWaivers ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sea" />
              </div>
            ) : waivers.length === 0 ? (
              <p className="py-10 text-center text-ink-3">No intake forms yet.</p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line bg-white">
                {waivers.map(waiver => (
                  <li key={waiver.id}>
                    <button
                      onClick={() => setSelectedWaiver(waiver)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-sand"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">{waiver.full_name}</span>
                        <span className="block truncate text-sm text-ink-2">{waiver.email}</span>
                      </span>
                      <span className="hidden flex-shrink-0 items-center gap-4 text-sm text-ink-3 sm:flex">
                        <span className="capitalize">{waiver.fitness_level}</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(waiver.signed_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {/* ── Bottom tab bar (phones) ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 backdrop-blur-sm sm:hidden"
        aria-label="Admin sections"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(t => tabButton(t.key, 'bottom'))}
      </nav>

      {/* ── Waiver Detail Modal ── */}
      {selectedWaiver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 p-4">
          <div className="my-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-6 py-4">
              <div>
                <p className="eyebrow">Intake form</p>
                <h2 className="text-2xl">{selectedWaiver.full_name}</h2>
              </div>
              <button onClick={() => setSelectedWaiver(null)} className="btn-quiet text-ink-3 hover:text-ink" aria-label="Close">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-6 px-6 py-6 text-sm">
              <div>
                <h3 className="mb-3 font-sans text-base font-semibold text-ink">About</h3>
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div><dt className="inline font-semibold text-ink-2">Email: </dt><dd className="inline">{selectedWaiver.email}</dd></div>
                  <div><dt className="inline font-semibold text-ink-2">Phone: </dt><dd className="inline">{selectedWaiver.phone}</dd></div>
                  <div><dt className="inline font-semibold text-ink-2">Date of birth: </dt><dd className="inline">{selectedWaiver.date_of_birth}</dd></div>
                  <div><dt className="inline font-semibold text-ink-2">Occupation: </dt><dd className="inline">{selectedWaiver.occupation}</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="mb-3 font-sans text-base font-semibold text-ink">Emergency contact</h3>
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
                  <div><dt className="inline font-semibold text-ink-2">Name: </dt><dd className="inline">{selectedWaiver.emergency_contact_name}</dd></div>
                  <div><dt className="inline font-semibold text-ink-2">Phone: </dt><dd className="inline">{selectedWaiver.emergency_contact_phone}</dd></div>
                  <div><dt className="inline font-semibold text-ink-2">Relationship: </dt><dd className="inline">{selectedWaiver.emergency_contact_relationship}</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="mb-3 font-sans text-base font-semibold text-ink">Health</h3>
                <div className="space-y-3">
                  {selectedWaiver.medical_conditions && <div><span className="font-semibold text-ink-2">Medical conditions</span><br />{selectedWaiver.medical_conditions}</div>}
                  {selectedWaiver.previous_injuries && <div><span className="font-semibold text-ink-2">Previous injuries</span><br />{selectedWaiver.previous_injuries}</div>}
                  {selectedWaiver.current_pain && <div><span className="font-semibold text-ink-2">Current pain</span><br />{selectedWaiver.current_pain}</div>}
                  {selectedWaiver.pregnancy_status && <div><span className="font-semibold text-ink-2">Pregnancy: </span>{selectedWaiver.pregnancy_status}</div>}
                  {!selectedWaiver.medical_conditions && !selectedWaiver.previous_injuries && !selectedWaiver.current_pain && !selectedWaiver.pregnancy_status && (
                    <p className="text-ink-3">Nothing reported.</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-sans text-base font-semibold text-ink">Movement background</h3>
                <div className="space-y-3">
                  <div><span className="font-semibold text-ink-2">Activity level: </span><span className="capitalize">{selectedWaiver.fitness_level}</span></div>
                  {selectedWaiver.exercise_history && <div><span className="font-semibold text-ink-2">Exercise history</span><br />{selectedWaiver.exercise_history}</div>}
                  {selectedWaiver.pilates_experience && <div><span className="font-semibold text-ink-2">Pilates experience</span><br />{selectedWaiver.pilates_experience}</div>}
                  <div><span className="font-semibold text-ink-2">Goals</span><br />{selectedWaiver.fitness_goals}</div>
                </div>
              </div>
              {(selectedWaiver.preferred_schedule || selectedWaiver.how_did_you_hear || selectedWaiver.additional_notes) && (
                <div>
                  <h3 className="mb-3 font-sans text-base font-semibold text-ink">Preferences</h3>
                  <div className="space-y-3">
                    {selectedWaiver.preferred_schedule && <div><span className="font-semibold text-ink-2">Preferred times: </span>{selectedWaiver.preferred_schedule}</div>}
                    {selectedWaiver.how_did_you_hear && <div><span className="font-semibold text-ink-2">Heard about the studio: </span>{selectedWaiver.how_did_you_hear}</div>}
                    {selectedWaiver.additional_notes && <div><span className="font-semibold text-ink-2">Notes</span><br />{selectedWaiver.additional_notes}</div>}
                  </div>
                </div>
              )}
              <div className="border-t border-line pt-4 text-ink-3">
                Signed {formatDate(selectedWaiver.signed_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
