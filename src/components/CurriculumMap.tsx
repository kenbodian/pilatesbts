import React, { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import type {
  InstructorClient, Exercise, ClientExerciseStatus,
  ExerciseStatus, Apparatus,
} from '../types/clientCards';
import { APPARATUS_LABELS, APPARATUS_ORDER } from '../types/clientCards';

// ─── Status colours ───────────────────────────────────────────────────────────
const STATUS_TILE: Record<ExerciseStatus, { bg: string; border: string; label: string }> = {
  not_started: { bg: 'bg-gray-100',   border: 'border-gray-200',  label: 'Not started' },
  introduced:  { bg: 'bg-amber-200',  border: 'border-amber-300', label: 'Introduced'  },
  developing:  { bg: 'bg-blue-200',   border: 'border-blue-300',  label: 'Developing'  },
  mastered:    { bg: 'bg-green-300',  border: 'border-green-400', label: 'Mastered'    },
};

// ─── Intro timeline inside the map ───────────────────────────────────────────
interface IntroTimelineProps {
  exercises: Exercise[];
  statusMap: Record<string, ClientExerciseStatus>;
}

function IntroTimeline({ exercises, statusMap }: IntroTimelineProps) {
  const introduced = exercises
    .filter(e => statusMap[e.id]?.introduced_at)
    .sort((a, b) =>
      new Date(statusMap[a.id].introduced_at!).getTime() -
      new Date(statusMap[b.id].introduced_at!).getTime()
    );

  if (introduced.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic text-center py-6">
        No exercises introduced yet. Progress will appear here as you teach.
      </p>
    );
  }

  // Group by month
  const byMonth: Record<string, typeof introduced> = {};
  introduced.forEach(ex => {
    const d = new Date(statusMap[ex.id].introduced_at!);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(ex);
  });

  return (
    <div className="space-y-4">
      {Object.entries(byMonth).map(([month, exs]) => (
        <div key={month}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{month}</p>
          <div className="space-y-1.5 pl-3 border-l-2 border-gray-100">
            {exs.map(ex => {
              const status = statusMap[ex.id]?.status ?? 'introduced';
              const tile = STATUS_TILE[status];
              return (
                <div key={ex.id} className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${tile.bg} border ${tile.border}`} />
                  <span className="text-sm text-gray-700">{ex.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{ex.apparatus.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Apparatus progress bar ───────────────────────────────────────────────────
interface ApparatusProgressProps {
  apparatus: Apparatus;
  exercises: Exercise[];
  statusMap: Record<string, ClientExerciseStatus>;
  onSelect: (a: Apparatus) => void;
  selected: boolean;
}

function ApparatusProgress({ apparatus, exercises, statusMap, onSelect, selected }: ApparatusProgressProps) {
  const counts = { not_started: 0, introduced: 0, developing: 0, mastered: 0 };
  exercises.forEach(e => {
    const s = statusMap[e.id]?.status ?? 'not_started';
    counts[s]++;
  });
  const total = exercises.length;
  const pct = (n: number) => `${(n / total * 100).toFixed(1)}%`;

  return (
    <button
      onClick={() => onSelect(apparatus)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        selected
          ? 'border-teal-400 bg-teal-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{APPARATUS_LABELS[apparatus]}</span>
        <span className="text-xs text-gray-400">{total} ex</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {counts.mastered > 0 && (
          <div className="bg-green-400 rounded-l-full" style={{ width: pct(counts.mastered) }} />
        )}
        {counts.developing > 0 && (
          <div className="bg-blue-400" style={{ width: pct(counts.developing) }} />
        )}
        {counts.introduced > 0 && (
          <div className="bg-amber-300" style={{ width: pct(counts.introduced) }} />
        )}
        {counts.not_started > 0 && (
          <div className="bg-gray-200 rounded-r-full flex-1" />
        )}
      </div>

      <div className="flex items-center space-x-2 mt-1">
        {counts.mastered > 0 && <span className="text-xs text-green-600">{counts.mastered}✓</span>}
        {counts.developing > 0 && <span className="text-xs text-blue-600">{counts.developing} devel</span>}
        {counts.introduced > 0 && <span className="text-xs text-amber-600">{counts.introduced} intro</span>}
      </div>
    </button>
  );
}

// ─── Tile grid for a single apparatus ────────────────────────────────────────
interface TileGridProps {
  apparatus: Apparatus;
  exercises: Exercise[];
  statusMap: Record<string, ClientExerciseStatus>;
}

function TileGrid({ apparatus, exercises, statusMap }: TileGridProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{APPARATUS_LABELS[apparatus]}</h4>
      <div className="flex flex-wrap gap-1.5">
        {exercises.map(ex => {
          const status = statusMap[ex.id]?.status ?? 'not_started';
          const tile = STATUS_TILE[status];
          const lastPracticed = statusMap[ex.id]?.last_practiced_at;
          return (
            <div
              key={ex.id}
              className="relative"
              onMouseEnter={() => setHovered(ex.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`w-6 h-6 rounded border cursor-default transition-transform hover:scale-125 ${tile.bg} ${tile.border}`}
                title={`${ex.name} — ${tile.label}`}
              />
              {hovered === ex.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                  {ex.name}
                  {lastPracticed && (
                    <span className="block text-gray-400 text-[10px]">
                      {new Date(lastPracticed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main CurriculumMap ───────────────────────────────────────────────────────
interface CurriculumMapProps {
  client: InstructorClient;
  exercises: Record<Apparatus, Exercise[]>;
  statusMap: Record<string, ClientExerciseStatus>;
  onBack: () => void;
}

export function CurriculumMap({ client, exercises, statusMap, onBack }: CurriculumMapProps) {
  const [tab, setTab] = useState<'map' | 'timeline'>('map');
  const [selectedApparatus, setSelectedApparatus] = useState<Apparatus | null>(null);

  const availableApparatus = APPARATUS_ORDER.filter(a => exercises[a]?.length > 0);
  const allExercises = Object.values(exercises).flat();

  // Overall stats
  const total = allExercises.length;
  const mastered = allExercises.filter(e => statusMap[e.id]?.status === 'mastered').length;
  const developing = allExercises.filter(e => statusMap[e.id]?.status === 'developing').length;
  const introduced = allExercises.filter(e => statusMap[e.id]?.status === 'introduced').length;
  const pctComplete = total > 0 ? Math.round(((mastered + developing * 0.6 + introduced * 0.3) / total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-light text-gray-800">Curriculum Map</h2>
          <p className="text-sm text-gray-400">{client.first_name} {client.last_name}</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-3xl font-light text-gray-800">{pctComplete}<span className="text-lg text-gray-400">%</span></p>
            <p className="text-xs text-gray-400 mt-0.5">Overall progression</p>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <p className="text-green-600 font-medium">{mastered} mastered</p>
            <p className="text-blue-600">{developing} developing</p>
            <p className="text-amber-600">{introduced} introduced</p>
            <p className="text-gray-400">{total - mastered - developing - introduced} not started</p>
          </div>
        </div>
        {/* Full stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-px">
          {mastered > 0   && <div className="bg-green-400" style={{ width: `${mastered/total*100}%` }} />}
          {developing > 0 && <div className="bg-blue-400"  style={{ width: `${developing/total*100}%` }} />}
          {introduced > 0 && <div className="bg-amber-300" style={{ width: `${introduced/total*100}%` }} />}
          <div className="bg-gray-100 flex-1" />
        </div>
        {/* Legend */}
        <div className="flex items-center space-x-3 mt-2">
          {([['bg-green-400','Mastered'],['bg-blue-400','Developing'],['bg-amber-300','Introduced'],['bg-gray-200','Not started']] as [string,string][]).map(([bg, label]) => (
            <div key={label} className="flex items-center space-x-1">
              <span className={`w-2.5 h-2.5 rounded-sm ${bg}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
        {(['map','timeline'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'map' ? 'Apparatus View' : 'Intro Timeline'}
          </button>
        ))}
      </div>

      {/* Map tab */}
      {tab === 'map' && (
        <div>
          {/* Apparatus progress bars (acts as nav) */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {availableApparatus.map(a => (
              <ApparatusProgress
                key={a}
                apparatus={a}
                exercises={exercises[a]}
                statusMap={statusMap}
                onSelect={a => setSelectedApparatus(prev => prev === a ? null : a)}
                selected={selectedApparatus === a}
              />
            ))}
          </div>

          {/* Tile grid — all or selected */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {selectedApparatus ? APPARATUS_LABELS[selectedApparatus] : 'All exercises'}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Info className="w-3 h-3" />
                <span>Hover to see name</span>
              </div>
            </div>

            {(selectedApparatus ? [selectedApparatus] : availableApparatus).map(a => (
              <TileGrid
                key={a}
                apparatus={a}
                exercises={exercises[a]}
                statusMap={statusMap}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline tab */}
      {tab === 'timeline' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <IntroTimeline
            exercises={allExercises}
            statusMap={statusMap}
          />
        </div>
      )}
    </div>
  );
}
