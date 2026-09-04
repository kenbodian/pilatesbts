import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp, StopCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type {
  InstructorClient, Exercise, ClientExerciseStatus,
  ExerciseStatus, Apparatus, Session,
} from '../types/clientCards';
import { APPARATUS_LABELS, APPARATUS_ORDER } from '../types/clientCards';

// ─── Timer ────────────────────────────────────────────────────────────────────
function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (ref.current) {
      clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return { seconds, formatted, running, toggle: () => setRunning(r => !r) };
}

// ─── Session exercise row ─────────────────────────────────────────────────────
interface SessionRowProps {
  exercise: Exercise;
  statusRecord: ClientExerciseStatus | null;
  checked: boolean;
  onToggle: () => void;
}

function SessionRow({ exercise, statusRecord, checked, onToggle }: SessionRowProps) {
  const status = statusRecord?.status ?? 'not_started';
  const springs = statusRecord?.custom_springs ?? exercise.springs;

  const statusDot: Record<ExerciseStatus, string> = {
    not_started: 'bg-line',
    introduced:  'bg-amber-400',
    developing:  'bg-sea',
    mastered:    'bg-sea',
  };

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center space-x-3 py-3 px-3 rounded transition-colors text-left ${
        checked
          ? 'bg-sea-tint border border-line'
          : 'hover:bg-foam border border-transparent'
      }`}
    >
      {checked
        ? <CheckCircle2 className="w-5 h-5 text-sea flex-shrink-0" />
        : <Circle className="w-5 h-5 text-line flex-shrink-0" />
      }

      <span className={`flex-1 text-sm ${checked ? 'text-sea-deep font-medium' : 'text-ink-2'}`}>
        {exercise.name}
      </span>

      {springs && (
        <span className="text-xs text-ink-3 font-mono flex-shrink-0">{springs}</span>
      )}

      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status]}`} title={status} />
    </button>
  );
}

// ─── Apparatus section ────────────────────────────────────────────────────────
interface SessionSectionProps {
  apparatus: Apparatus;
  exercises: Exercise[];
  statusMap: Record<string, ClientExerciseStatus>;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}

function SessionSection({ apparatus, exercises, statusMap, checkedIds, onToggle }: SessionSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const checkedCount = exercises.filter(e => checkedIds.has(e.id)).length;

  return (
    <div className="mb-3">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2 bg-sand rounded hover:bg-line transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-ink-2 text-sm">{APPARATUS_LABELS[apparatus]}</span>
          <span className="text-xs text-ink-3">{exercises.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          {checkedCount > 0 && (
            <span className="text-xs bg-sea-tint text-sea-deep px-2 py-0.5 rounded-full font-medium">
              {checkedCount} done
            </span>
          )}
          {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-ink-3" /> : <ChevronUp className="w-3.5 h-3.5 text-ink-3" />}
        </div>
      </button>

      {!collapsed && (
        <div className="mt-1">
          {exercises.map(ex => (
            <SessionRow
              key={ex.id}
              exercise={ex}
              statusRecord={statusMap[ex.id] ?? null}
              checked={checkedIds.has(ex.id)}
              onToggle={() => onToggle(ex.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── End session confirmation ─────────────────────────────────────────────────
interface EndSessionModalProps {
  checkedCount: number;
  sessionNotes: string;
  onNotesChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  saving: boolean;
}

function EndSessionModal({ checkedCount, sessionNotes, onNotesChange, onConfirm, onCancel, saving }: EndSessionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-lg sm:rounded-lg shadow-xl">
        <div className="px-5 pt-5 pb-2">
          <h3 className="font-semibold text-ink text-lg">End Session</h3>
          <p className="text-sm text-ink-3 mt-1">
            {checkedCount} exercise{checkedCount !== 1 ? 's' : ''} completed this session.
          </p>
        </div>
        <div className="px-5 pb-3">
          <label className="block text-xs font-medium text-ink-3 mb-1.5">Session notes (optional)</label>
          <textarea
            className="w-full border border-line rounded p-3 text-sm text-ink-2 resize-none focus:outline-none focus:ring-2 focus:ring-sea focus:border-transparent"
            rows={3}
            placeholder="How did it go? What to focus on next time…"
            value={sessionNotes}
            onChange={e => onNotesChange(e.target.value)}
            autoFocus
          />
        </div>
        <div className="px-5 pb-5 flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-line rounded text-sm text-ink-2 hover:bg-foam font-medium"
          >
            Keep going
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-sea text-white rounded text-sm font-medium hover:bg-sea-deep disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save & Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main SessionView ─────────────────────────────────────────────────────────
interface SessionViewProps {
  client: InstructorClient;
  exercises: Record<Apparatus, Exercise[]>;
  statusMap: Record<string, ClientExerciseStatus>;
  instructorId: string;
  onSessionSaved: (session: Session, updatedStatusMap: Record<string, ClientExerciseStatus>) => void;
  onDiscard: () => void;
}

export function SessionView({
  client, exercises, statusMap, instructorId, onSessionSaved, onDiscard,
}: SessionViewProps) {
  const timer = useTimer();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();

      // 1. Insert session record
      const { data: sessionData, error: sessionErr } = await supabase
        .from('sessions')
        .insert({
          client_id: client.id,
          instructor_id: instructorId,
          session_date: new Date().toISOString().split('T')[0],
          duration_minutes: Math.round(timer.seconds / 60),
          notes: sessionNotes.trim() || null,
        })
        .select()
        .single();

      if (sessionErr) throw sessionErr;

      // 2. Insert session_exercises for all checked exercises
      const checkedArray = Array.from(checkedIds);
      if (checkedArray.length > 0) {
        const { error: seErr } = await supabase
          .from('session_exercises')
          .insert(checkedArray.map(exercise_id => ({
            session_id: sessionData.id,
            exercise_id,
            completed: true,
          })));
        if (seErr) throw seErr;
      }

      // 3. Bulk update last_practiced_at for all checked exercises
      if (checkedArray.length > 0) {
        // Upsert: create status record if it doesn't exist, update if it does
        const upserts = checkedArray.map(exercise_id => {
          const existing = statusMap[exercise_id];
          return {
            client_id: client.id,
            exercise_id,
            status: (existing?.status && existing.status !== 'not_started')
              ? existing.status
              : 'introduced' as const,
            introduced_at: existing?.introduced_at ?? now,
            last_practiced_at: now,
            custom_springs: existing?.custom_springs ?? null,
            exercise_notes: existing?.exercise_notes ?? null,
          };
        });

        await supabase
          .from('client_exercise_status')
          .upsert(upserts, { onConflict: 'client_id,exercise_id' });
      }

      // 4. Build updated status map to pass back up
      const updatedMap = { ...statusMap };
      checkedArray.forEach(exercise_id => {
        const existing = statusMap[exercise_id];
        updatedMap[exercise_id] = {
          id: existing?.id ?? '',
          client_id: client.id,
          exercise_id,
          status: (existing?.status && existing.status !== 'not_started')
            ? existing.status
            : 'introduced',
          custom_springs: existing?.custom_springs ?? null,
          exercise_notes: existing?.exercise_notes ?? null,
          introduced_at: existing?.introduced_at ?? now,
          last_practiced_at: now,
        };
      });

      onSessionSaved(sessionData as Session, updatedMap);
    } catch (err) {
      console.error('Error saving session:', err);
    } finally {
      setSaving(false);
    }
  };

  const availableApparatus = APPARATUS_ORDER.filter(a => exercises[a]?.length > 0);
  const totalChecked = checkedIds.size;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-sand z-20 px-0 py-3 -mx-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onDiscard}
              className="p-2 text-ink-3 hover:text-ink-2 hover:bg-sand rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-semibold text-ink text-sm leading-none">
                {client.first_name} {client.last_name}
              </p>
              <p className="text-xs text-ink-3 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Timer */}
            <button
              onClick={timer.toggle}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                timer.running
                  ? 'bg-sand text-ink-2 hover:bg-line'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timer.formatted}</span>
            </button>

            {/* End session */}
            <button
              onClick={() => setShowEndModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-sea text-white rounded text-sm font-medium hover:bg-sea-deep transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>End</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalChecked > 0 && (
          <div className="mt-2.5 flex items-center space-x-2">
            <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
              <div
                className="h-full bg-sea rounded-full transition-colors duration-300"
                style={{ width: `${Math.min(100, (totalChecked / Math.max(1, Object.values(exercises).flat().length)) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-sea font-medium flex-shrink-0">{totalChecked} done</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-ink-3 mt-4 mb-3 px-1">
        Tap each exercise as you complete it. Status dot shows current level.
      </p>

      {/* Exercise sections */}
      {availableApparatus.map(apparatus => (
        <SessionSection
          key={apparatus}
          apparatus={apparatus}
          exercises={exercises[apparatus]}
          statusMap={statusMap}
          checkedIds={checkedIds}
          onToggle={toggle}
        />
      ))}

      {/* End session modal */}
      {showEndModal && (
        <EndSessionModal
          checkedCount={totalChecked}
          sessionNotes={sessionNotes}
          onNotesChange={setSessionNotes}
          onConfirm={handleSave}
          onCancel={() => setShowEndModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
