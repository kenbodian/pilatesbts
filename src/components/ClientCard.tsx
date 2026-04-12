import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ChevronDown, ChevronUp, MessageSquare, X, AlertTriangle,
  Play, History, Map, Download,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type {
  InstructorClient, Exercise, ClientExerciseStatus,
  ExerciseStatus, Apparatus, Session,
} from '../types/clientCards';
import { APPARATUS_LABELS, APPARATUS_ORDER } from '../types/clientCards';
import { SessionView } from './SessionView';
import { SessionHistory } from './SessionHistory';
import { CurriculumMap } from './CurriculumMap';
import { exportClientCardPDF } from '../utils/exportClientPDF';

// ─── Status cycling ────────────────────────────────────────────────────────────
const STATUS_CYCLE: ExerciseStatus[] = ['not_started', 'introduced', 'developing', 'mastered'];

const STATUS_STYLE: Record<ExerciseStatus, { bg: string; text: string; label: string }> = {
  not_started: { bg: 'bg-gray-100',   text: 'text-gray-400',  label: '—'         },
  introduced:  { bg: 'bg-amber-100',  text: 'text-amber-700', label: 'Intro'     },
  developing:  { bg: 'bg-blue-100',   text: 'text-blue-700',  label: 'Devel'     },
  mastered:    { bg: 'bg-green-100',  text: 'text-green-700', label: '✓ Mastered' },
};

// Exercises not done in 4+ weeks are flagged as "due for review"
const isDueForReview = (status: ClientExerciseStatus | null): boolean => {
  if (!status || status.status === 'not_started' || !status.last_practiced_at) return false;
  const lastPracticed = new Date(status.last_practiced_at);
  const daysSince = (Date.now() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > 28;
};

// ─── Notes popover ────────────────────────────────────────────────────────────
interface NotesPopoverProps {
  exerciseName: string;
  notes: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

function NotesPopover({ exerciseName, notes, onSave, onClose }: NotesPopoverProps) {
  const [value, setValue] = useState(notes);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800 text-sm leading-tight max-w-[80%]">{exerciseName}</p>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            rows={4}
            placeholder="Add cues, modifications, or observations…"
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <button
              onClick={() => { onSave(value); onClose(); }}
              className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              Save note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single exercise row ───────────────────────────────────────────────────────
interface ExerciseRowProps {
  exercise: Exercise;
  statusRecord: ClientExerciseStatus | null;
  onStatusChange: (exercise: Exercise, newStatus: ExerciseStatus) => void;
  onNotesChange: (exercise: Exercise, notes: string) => void;
}

function ExerciseRow({ exercise, statusRecord, onStatusChange, onNotesChange }: ExerciseRowProps) {
  const [showNotes, setShowNotes] = useState(false);
  const status = statusRecord?.status ?? 'not_started';
  const style = STATUS_STYLE[status];
  const review = isDueForReview(statusRecord);
  const springs = statusRecord?.custom_springs ?? exercise.springs;

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onStatusChange(exercise, next);
  };

  return (
    <>
      <div className={`flex items-center space-x-2 py-2.5 px-3 rounded-lg group hover:bg-gray-50 transition-colors ${
        status === 'mastered' ? 'opacity-70' : ''
      }`}>
        {/* Status badge — tap to cycle */}
        <button
          onClick={cycleStatus}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 active:scale-95 ${style.bg} ${style.text}`}
          title={`Tap to advance: ${status}`}
        >
          {style.label}
        </button>

        {/* Exercise name */}
        <span className={`flex-1 text-sm ${status === 'mastered' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {exercise.name}
        </span>

        {/* Due for review flag */}
        {review && (
          <span title="Not practiced in 4+ weeks" className="flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </span>
        )}

        {/* Spring setting */}
        {springs && (
          <span className="flex-shrink-0 text-xs text-gray-400 font-mono min-w-[1.5rem] text-right">
            {springs}
          </span>
        )}

        {/* Notes button */}
        <button
          onClick={() => setShowNotes(true)}
          className={`flex-shrink-0 p-1 rounded transition-colors ${
            statusRecord?.exercise_notes
              ? 'text-teal-500 hover:text-teal-700'
              : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500'
          }`}
          title="Exercise notes"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notes popover */}
      {showNotes && (
        <NotesPopover
          exerciseName={exercise.name}
          notes={statusRecord?.exercise_notes ?? ''}
          onSave={notes => onNotesChange(exercise, notes)}
          onClose={() => setShowNotes(false)}
        />
      )}
    </>
  );
}

// ─── Apparatus section ────────────────────────────────────────────────────────
interface ApparatusSectionProps {
  apparatus: Apparatus;
  exercises: Exercise[];
  statusMap: Record<string, ClientExerciseStatus>;
  onStatusChange: (exercise: Exercise, newStatus: ExerciseStatus) => void;
  onNotesChange: (exercise: Exercise, notes: string) => void;
}

function ApparatusSection({
  apparatus, exercises, statusMap, onStatusChange, onNotesChange
}: ApparatusSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const masteredCount = exercises.filter(e => statusMap[e.id]?.status === 'mastered').length;
  const introducedCount = exercises.filter(e =>
    statusMap[e.id]?.status === 'introduced' || statusMap[e.id]?.status === 'developing'
  ).length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700 text-sm">{APPARATUS_LABELS[apparatus]}</span>
          <span className="text-xs text-gray-400">{exercises.length} exercises</span>
        </div>
        <div className="flex items-center space-x-2">
          {masteredCount > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {masteredCount} mastered
            </span>
          )}
          {introducedCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {introducedCount} in progress
            </span>
          )}
          {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {!collapsed && (
        <div className="mt-1 divide-y divide-gray-100">
          {exercises.map(ex => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              statusRecord={statusMap[ex.id] ?? null}
              onStatusChange={onStatusChange}
              onNotesChange={onNotesChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Client info header ────────────────────────────────────────────────────────
interface ClientInfoHeaderProps {
  client: InstructorClient;
  onUpdateClient: (updates: Partial<InstructorClient>) => void;
}

function ClientInfoHeader({ client, onUpdateClient }: ClientInfoHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    height: client.height ?? '',
    weight: client.weight ?? '',
    goals: client.goals ?? '',
    injuries: client.injuries ?? '',
    pain_scale: client.pain_scale?.toString() ?? '',
    notes: client.notes ?? '',
  });

  const save = async () => {
    const updates: Partial<InstructorClient> = {
      height: form.height || null,
      weight: form.weight || null,
      goals: form.goals || null,
      injuries: form.injuries || null,
      pain_scale: form.pain_scale ? parseInt(form.pain_scale, 10) : null,
      notes: form.notes || null,
    };
    await supabase.from('instructor_clients').update(updates).eq('id', client.id);
    onUpdateClient(updates);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Height', key: 'height' },
            { label: 'Weight', key: 'weight' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pain scale (0–10)</label>
            <input
              type="number" min="0" max="10"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              value={form.pain_scale}
              onChange={e => setForm(f => ({ ...f, pain_scale: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Goals</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} />
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Injuries / Considerations</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            value={form.injuries} onChange={e => setForm(f => ({ ...f, injuries: e.target.value }))} />
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">General notes</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 mb-4 cursor-pointer hover:border-teal-300 transition-colors"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <div className="flex flex-wrap gap-3 text-sm">
        {client.height && (
          <span className="text-gray-600"><span className="font-medium text-gray-400 text-xs uppercase tracking-wide mr-1">Ht</span>{client.height}</span>
        )}
        {client.weight && (
          <span className="text-gray-600"><span className="font-medium text-gray-400 text-xs uppercase tracking-wide mr-1">Wt</span>{client.weight}</span>
        )}
        {client.pain_scale !== null && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            client.pain_scale >= 7 ? 'bg-red-100 text-red-700' :
            client.pain_scale >= 4 ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>Pain {client.pain_scale}/10</span>
        )}
      </div>
      {client.goals && (
        <p className="text-sm text-gray-600 mt-2"><span className="font-medium text-gray-500">Goals:</span> {client.goals}</p>
      )}
      {client.injuries && (
        <p className="text-sm text-amber-700 mt-1"><span className="font-medium">⚠ </span>{client.injuries}</p>
      )}
      {client.notes && (
        <p className="text-sm text-gray-500 mt-1 italic">{client.notes}</p>
      )}
      {!client.height && !client.goals && !client.injuries && (
        <p className="text-sm text-gray-400 italic">Tap to add client info (height, weight, goals, injuries…)</p>
      )}
    </div>
  );
}

// ─── Main ClientCard component ────────────────────────────────────────────────
type CardView = 'card' | 'session' | 'history' | 'map';

interface ClientCardProps {
  client: InstructorClient;
  instructorId: string;
  onBack: () => void;
}

export function ClientCard({ client: initialClient, instructorId, onBack }: ClientCardProps) {
  const [client, setClient] = useState(initialClient);
  const [exercises, setExercises] = useState<Record<Apparatus, Exercise[]>>({} as Record<Apparatus, Exercise[]>);
  const [statusMap, setStatusMap] = useState<Record<string, ClientExerciseStatus>>({});
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [activeApparatus, setActiveApparatus] = useState<Apparatus | 'all'>('all');
  const [view, setView] = useState<CardView>('card');

  useEffect(() => {
    loadData();
  }, [client.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load exercises and existing status records in parallel
      const [exResult, statusResult] = await Promise.all([
        supabase.from('exercises').select('*').order('order_index', { ascending: true }),
        supabase.from('client_exercise_status').select('*').eq('client_id', client.id),
      ]);

      if (exResult.error) throw exResult.error;

      // Group exercises by apparatus
      const grouped: Record<string, Exercise[]> = {};
      (exResult.data || []).forEach(ex => {
        if (!grouped[ex.apparatus]) grouped[ex.apparatus] = [];
        grouped[ex.apparatus].push(ex);
      });
      setExercises(grouped as Record<Apparatus, Exercise[]>);

      // Build status map keyed by exercise_id
      const sMap: Record<string, ClientExerciseStatus> = {};
      (statusResult.data || []).forEach(s => {
        sMap[s.exercise_id] = s;
      });
      setStatusMap(sMap);
    } catch (err) {
      console.error('Error loading card data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = useCallback(async (exercise: Exercise, newStatus: ExerciseStatus) => {
    const existing = statusMap[exercise.id];
    const now = new Date().toISOString();

    // Optimistic update
    const optimistic: ClientExerciseStatus = {
      id: existing?.id ?? '',
      client_id: client.id,
      exercise_id: exercise.id,
      status: newStatus,
      custom_springs: existing?.custom_springs ?? null,
      exercise_notes: existing?.exercise_notes ?? null,
      introduced_at: existing?.introduced_at ?? (newStatus !== 'not_started' ? now : null),
      last_practiced_at: newStatus !== 'not_started' ? now : existing?.last_practiced_at ?? null,
    };

    setStatusMap(prev => ({ ...prev, [exercise.id]: optimistic }));
    setSavingIds(prev => new Set(prev).add(exercise.id));

    try {
      if (existing) {
        await supabase
          .from('client_exercise_status')
          .update({
            status: newStatus,
            introduced_at: optimistic.introduced_at,
            last_practiced_at: optimistic.last_practiced_at,
          })
          .eq('id', existing.id);
      } else {
        const { data } = await supabase
          .from('client_exercise_status')
          .insert({
            client_id: client.id,
            exercise_id: exercise.id,
            status: newStatus,
            introduced_at: newStatus !== 'not_started' ? now : null,
            last_practiced_at: newStatus !== 'not_started' ? now : null,
          })
          .select()
          .single();

        if (data) {
          setStatusMap(prev => ({ ...prev, [exercise.id]: data }));
        }
      }
    } catch (err) {
      console.error('Error saving status:', err);
      // Revert on error
      setStatusMap(prev => {
        const next = { ...prev };
        if (existing) next[exercise.id] = existing;
        else delete next[exercise.id];
        return next;
      });
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(exercise.id);
        return next;
      });
    }
  }, [client.id, statusMap]);

  const handleNotesChange = useCallback(async (exercise: Exercise, notes: string) => {
    const existing = statusMap[exercise.id];

    setStatusMap(prev => ({
      ...prev,
      [exercise.id]: {
        ...(prev[exercise.id] ?? {
          id: '',
          client_id: client.id,
          exercise_id: exercise.id,
          status: 'not_started' as ExerciseStatus,
          custom_springs: null,
          introduced_at: null,
          last_practiced_at: null,
        }),
        exercise_notes: notes || null,
      },
    }));

    if (existing) {
      await supabase
        .from('client_exercise_status')
        .update({ exercise_notes: notes || null })
        .eq('id', existing.id);
    } else if (notes) {
      const { data } = await supabase
        .from('client_exercise_status')
        .insert({
          client_id: client.id,
          exercise_id: exercise.id,
          status: 'not_started',
          exercise_notes: notes,
        })
        .select()
        .single();
      if (data) setStatusMap(prev => ({ ...prev, [exercise.id]: data }));
    }
  }, [client.id, statusMap]);

  // Summary stats
  const allExercises = Object.values(exercises).flat();
  const totalCount = allExercises.length;
  const masteredCount = allExercises.filter(e => statusMap[e.id]?.status === 'mastered').length;
  const inProgressCount = allExercises.filter(e =>
    statusMap[e.id]?.status === 'introduced' || statusMap[e.id]?.status === 'developing'
  ).length;

  const availableApparatus = APPARATUS_ORDER.filter(a => exercises[a]?.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  // ── Session view ──
  if (view === 'session') {
    return (
      <SessionView
        client={client}
        exercises={exercises}
        statusMap={statusMap}
        instructorId={instructorId}
        onSessionSaved={(_session: Session, updatedMap) => {
          setStatusMap(updatedMap);
          setView('card');
        }}
        onDiscard={() => setView('card')}
      />
    );
  }

  // ── Curriculum map view ──
  if (view === 'map') {
    return (
      <CurriculumMap
        client={client}
        exercises={exercises}
        statusMap={statusMap}
        onBack={() => setView('card')}
      />
    );
  }

  return (
    <div>
      {/* Back + name */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-light text-gray-800">
            {client.first_name} {client.last_name}
          </h2>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setView('session')}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Start Session</span>
        </button>
        <button
          onClick={() => setView('map')}
          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          title="Curriculum Map"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Map</span>
        </button>
        <button
          onClick={() => setView(view === 'history' ? 'card' : 'history')}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            view === 'history'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Session History"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </button>
        <button
          onClick={() => exportClientCardPDF(client, exercises, statusMap)}
          className="flex items-center justify-center px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          title="Export PDF"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Session history panel */}
      {view === 'history' && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Session History</h3>
          <SessionHistory clientId={client.id} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-light text-gray-700">{totalCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Exercises</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-light text-blue-600">{inProgressCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">In Progress</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-light text-green-600">{masteredCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Mastered</p>
        </div>
      </div>

      {/* Client info */}
      <ClientInfoHeader
        client={client}
        onUpdateClient={updates => setClient(c => ({ ...c, ...updates }))}
      />

      {/* Legend */}
      <div className="flex items-center space-x-3 mb-4 px-1 flex-wrap gap-y-1">
        {Object.entries(STATUS_STYLE).map(([status, style]) => (
          <span key={status} className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-1">← tap to advance</span>
        <span className="ml-auto text-xs text-gray-400 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>= due for review</span>
        </span>
      </div>

      {/* Apparatus filter tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveApparatus('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeApparatus === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {availableApparatus.map(a => (
          <button
            key={a}
            onClick={() => setActiveApparatus(a)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeApparatus === a
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {APPARATUS_LABELS[a]}
          </button>
        ))}
      </div>

      {/* Exercise sections */}
      <div>
        {(activeApparatus === 'all' ? availableApparatus : [activeApparatus as Apparatus])
          .filter(a => exercises[a]?.length > 0)
          .map(apparatus => (
            <ApparatusSection
              key={apparatus}
              apparatus={apparatus}
              exercises={exercises[apparatus]}
              statusMap={statusMap}
              onStatusChange={handleStatusChange}
              onNotesChange={handleNotesChange}
            />
          ))}
      </div>

      {/* Saving indicator */}
      {savingIds.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-full shadow-lg flex items-center space-x-1.5 opacity-80">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
          <span>Saving…</span>
        </div>
      )}
    </div>
  );
}
