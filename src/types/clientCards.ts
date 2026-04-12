// ─── Client Cards Feature Types ───────────────────────────────────────────────

export type ExerciseStatus = 'not_started' | 'introduced' | 'developing' | 'mastered';

export type Apparatus =
  | 'reformer'
  | 'mat'
  | 'magic_circle'
  | 'cadillac'
  | 'big_chair'
  | 'wunda_chair'
  | 'small_barrel'
  | 'arm_weights'
  | 'ped_o_pul'
  | 'large_barrel';

export const APPARATUS_LABELS: Record<Apparatus, string> = {
  reformer:     'Reformer',
  mat:          'Mat',
  magic_circle: 'Magic Circle',
  cadillac:     'Cadillac',
  big_chair:    'Big Chair',
  wunda_chair:  'Wunda Chair',
  small_barrel: 'Small Barrel',
  arm_weights:  'Arm Weights',
  ped_o_pul:    'Ped-O-Pul',
  large_barrel: 'Large Barrel',
};

export const APPARATUS_ORDER: Apparatus[] = [
  'reformer',
  'mat',
  'magic_circle',
  'cadillac',
  'big_chair',
  'wunda_chair',
  'small_barrel',
  'arm_weights',
  'ped_o_pul',
  'large_barrel',
];

export interface Exercise {
  id: string;
  apparatus: Apparatus;
  name: string;
  springs: string | null;
  order_index: number;
}

export interface InstructorClient {
  id: string;
  created_by: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  height: string | null;
  weight: string | null;
  goals: string | null;
  injuries: string | null;
  pain_scale: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientExerciseStatus {
  id: string;
  client_id: string;
  exercise_id: string;
  status: ExerciseStatus;
  custom_springs: string | null;
  exercise_notes: string | null;
  introduced_at: string | null;
  last_practiced_at: string | null;
}

export interface Session {
  id: string;
  client_id: string;
  instructor_id: string | null;
  session_date: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  completed: boolean;
  notes: string | null;
}

// Combined view: exercise + its status for a specific client
export interface ExerciseWithStatus extends Exercise {
  statusRecord: ClientExerciseStatus | null;
}
