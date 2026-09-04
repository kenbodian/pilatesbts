import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { InstructorClient } from '../types/clientCards';

interface DueItem {
  client: InstructorClient;
  exerciseName: string;
  apparatus: string;
  daysSince: number;
  status: string;
}

interface DueForReviewProps {
  onSelectClient: (client: InstructorClient) => void;
}

export function DueForReview({ onSelectClient }: DueForReviewProps) {
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueItems();
  }, []);

  const loadDueItems = async () => {
    setLoading(true);
    try {
      // Fetch all exercise statuses with last_practiced_at older than 28 days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 28);

      const { data, error } = await supabase
        .from('client_exercise_status')
        .select(`
          status,
          last_practiced_at,
          instructor_clients (id, first_name, last_name, photo_url, created_by, height, weight, goals, injuries, pain_scale, notes, created_at, updated_at),
          exercises (name, apparatus)
        `)
        .neq('status', 'not_started')
        .lt('last_practiced_at', cutoff.toISOString())
        .order('last_practiced_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const mapped: DueItem[] = (data || [])
        .filter((row: any) => row.instructor_clients && row.exercises)
        .map((row: any) => ({
          client: row.instructor_clients as InstructorClient,
          exerciseName: row.exercises.name,
          apparatus: row.exercises.apparatus.replace(/_/g, ' '),
          daysSince: Math.floor(
            (Date.now() - new Date(row.last_practiced_at).getTime()) / (1000 * 60 * 60 * 24)
          ),
          status: row.status,
        }));

      setItems(mapped);
    } catch (err) {
      console.error('Error loading due items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 bg-sea-tint rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-sea" />
        </div>
        <p className="text-ink-2 font-medium">All caught up!</p>
        <p className="text-sm text-ink-3 mt-1">No exercises due for review across all clients.</p>
      </div>
    );
  }

  // Group by client
  const byClient: Record<string, { client: InstructorClient; items: DueItem[] }> = {};
  items.forEach(item => {
    const key = item.client.id;
    if (!byClient[key]) byClient[key] = { client: item.client, items: [] };
    byClient[key].items.push(item);
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
        {items.length} exercise{items.length !== 1 ? 's' : ''} across {Object.keys(byClient).length} client{Object.keys(byClient).length !== 1 ? 's' : ''} haven't been practiced in 4+ weeks.
      </p>

      {Object.values(byClient).map(({ client, items: clientItems }) => (
        <button
          key={client.id}
          onClick={() => onSelectClient(client)}
          className="w-full text-left bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-colors p-4 group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-ink group-hover:text-amber-700 transition-colors">
              {client.first_name} {client.last_name}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {clientItems.length} due
              </span>
              <ChevronRight className="w-4 h-4 text-ink-3 group-hover:text-amber-500" />
            </div>
          </div>
          <div className="space-y-1">
            {clientItems.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm text-ink-2">
                <span className="text-line">·</span>
                <span className="flex-1 truncate">{item.exerciseName}</span>
                <span className="text-xs text-amber-600 flex-shrink-0">{item.daysSince}d ago</span>
              </div>
            ))}
            {clientItems.length > 3 && (
              <p className="text-xs text-ink-3 pl-3">+{clientItems.length - 3} more</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
