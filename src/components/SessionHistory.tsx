import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session, Exercise } from '../types/clientCards';

interface SessionWithExercises extends Session {
  exercises: { exercise: Exercise; completed: boolean }[];
}

interface SessionHistoryProps {
  clientId: string;
}

export function SessionHistory({ clientId }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [clientId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Load sessions with their exercises via join
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          session_exercises (
            completed,
            exercises (id, apparatus, name, springs, order_index)
          )
        `)
        .eq('client_id', clientId)
        .order('session_date', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped = (data || []).map((s: any) => ({
        ...s,
        exercises: (s.session_exercises || []).map((se: any) => ({
          exercise: se.exercises,
          completed: se.completed,
        })),
      }));

      setSessions(mapped);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sea" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-ink-3 text-center py-6 italic">
        No sessions recorded yet. Tap "Start Session" to log your first session.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map(session => {
        const completedCount = session.exercises.filter(e => e.completed).length;
        const isExpanded = expandedId === session.id;

        return (
          <div key={session.id} className="border border-line rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-foam transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sea-tint rounded flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-sea" />
                </div>
                <div>
                  <p className="font-medium text-ink text-sm">{formatDate(session.session_date)}</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs text-sea font-medium">{completedCount} exercises</span>
                    {session.duration_minutes != null && session.duration_minutes > 0 && (
                      <>
                        <span className="text-xs text-line">·</span>
                        <span className="text-xs text-ink-3 flex items-center space-x-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{session.duration_minutes} min</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {isExpanded
                ? <ChevronUp className="w-4 h-4 text-ink-3 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-ink-3 flex-shrink-0" />
              }
            </button>

            {isExpanded && (
              <div className="border-t border-sand px-4 py-3 bg-foam">
                {session.notes && (
                  <p className="text-sm text-ink-2 italic mb-3 pb-3 border-b border-line">
                    "{session.notes}"
                  </p>
                )}
                <div className="grid grid-cols-1 gap-1">
                  {session.exercises
                    .filter(e => e.completed)
                    .map(({ exercise }) => (
                      <div key={exercise.id} className="flex items-center space-x-2 text-sm text-ink-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sea flex-shrink-0" />
                        <span>{exercise.name}</span>
                        <span className="text-xs text-ink-3 ml-auto">{exercise.apparatus.replace('_', ' ')}</span>
                      </div>
                    ))
                  }
                </div>
                {completedCount === 0 && (
                  <p className="text-xs text-ink-3 italic">No exercises logged for this session.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
