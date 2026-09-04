import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronRight, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { InstructorClient } from '../types/clientCards';

interface ClientRosterProps {
  onSelectClient: (client: InstructorClient) => void;
  onAddClient: () => void;
}

export function ClientRoster({ onSelectClient, onAddClient }: ClientRosterProps) {
  const [clients, setClients] = useState<InstructorClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [masteredCounts, setMasteredCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('instructor_clients')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      const clientList = data || [];
      setClients(clientList);

      // Load mastered counts for all clients in one query
      if (clientList.length > 0) {
        const { data: statusData } = await supabase
          .from('client_exercise_status')
          .select('client_id')
          .eq('status', 'mastered')
          .in('client_id', clientList.map(c => c.id));

        const counts: Record<string, number> = {};
        (statusData || []).forEach(row => {
          counts[row.client_id] = (counts[row.client_id] || 0) + 1;
        });
        setMasteredCounts(counts);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (client: InstructorClient) =>
    `${client.first_name[0]}${client.last_name[0]}`.toUpperCase();

  // Avatars stay inside the brand: tints and depths of the one accent
  const avatarColors = [
    'bg-sea text-white', 'bg-sea-deep text-white', 'bg-sea-tint text-sea-deep',
    'bg-sand-deep text-ink', 'bg-ink text-white', 'bg-sand text-sea-deep',
  ];

  const getColor = (client: InstructorClient) =>
    avatarColors[(client.first_name.charCodeAt(0) + client.last_name.charCodeAt(0)) % avatarColors.length];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sea" />
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl">Clients</h2>
          <p className="text-sm text-ink-3 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onAddClient}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-line rounded-lg">
          <div className="w-16 h-16 bg-sea-tint rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-sea" />
          </div>
          <p className="text-ink-2 font-medium mb-1">No clients yet</p>
          <p className="text-sm text-ink-3 mb-4">Add your first client to get started</p>
          <button
            onClick={onAddClient}
            className="btn-primary"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="w-full flex items-center space-x-4 p-4 bg-white rounded-lg border border-line hover:border-sea hover:shadow-md transition-colors text-left group"
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getColor(client)}`}>
                {client.photo_url ? (
                  <img src={client.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(client)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink group-hover:text-sea-deep transition-colors">
                  {client.first_name} {client.last_name}
                </p>
                <div className="flex items-center space-x-3 mt-0.5">
                  {client.goals && (
                    <p className="text-sm text-ink-3 truncate">{client.goals}</p>
                  )}
                  {client.pain_scale !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      client.pain_scale >= 7 ? 'bg-red-100 text-red-700' :
                      client.pain_scale >= 4 ? 'bg-amber-100 text-amber-700' :
                      'bg-sea-tint text-sea-deep'
                    }`}>
                      Pain {client.pain_scale}/10
                    </span>
                  )}
                </div>
              </div>

              {/* Mastered count */}
              {(masteredCounts[client.id] || 0) > 0 && (
                <div className="flex items-center space-x-1 text-sea flex-shrink-0">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">{masteredCounts[client.id]}</span>
                </div>
              )}

              <ChevronRight className="w-4 h-4 text-ink-3 group-hover:text-sea transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
