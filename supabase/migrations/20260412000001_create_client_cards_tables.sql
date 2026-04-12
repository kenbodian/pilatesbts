/*
  # Client Cards Feature: Core Tables

  1. New Tables
    - `exercises`
        Reference list of all classical Pilates exercises, organized by apparatus.
        Pre-seeded. Read-only for authenticated users.

    - `instructor_clients`
        Instructor-managed client profiles (separate from the portal auth system).
        Only admins can create/read/update/delete.

    - `client_exercise_status`
        Tracks each client's progress on each exercise:
        status: not_started | introduced | developing | mastered
        Stores custom spring overrides and per-exercise notes.

  2. Security
    - exercises: any authenticated user can read (public reference data)
    - instructor_clients: admin-only CRUD
    - client_exercise_status: admin-only CRUD
*/

-- ─── exercises ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercises (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  apparatus    text    NOT NULL,
  name         text    NOT NULL,
  springs      text,               -- default spring setting, e.g. "4", "2", "4/3/2"
  order_index  integer NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exercises"
  ON exercises FOR SELECT TO authenticated USING (true);

-- ─── instructor_clients ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instructor_clients (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name     text    NOT NULL,
  last_name      text    NOT NULL,
  photo_url      text,
  height         text,
  weight         text,
  goals          text,
  injuries       text,
  pain_scale     integer CHECK (pain_scale BETWEEN 0 AND 10),
  notes          text,
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE instructor_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage instructor clients"
  ON instructor_clients FOR ALL TO authenticated
  USING  (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_instructor_clients_created_by
  ON instructor_clients(created_by);

-- ─── client_exercise_status ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_exercise_status (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid    REFERENCES instructor_clients(id) ON DELETE CASCADE NOT NULL,
  exercise_id       uuid    REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  status            text    NOT NULL DEFAULT 'not_started'
                            CHECK (status IN ('not_started','introduced','developing','mastered')),
  custom_springs    text,            -- instructor override for this client
  exercise_notes    text,            -- cues, modifications, observations
  introduced_at     timestamptz,
  last_practiced_at timestamptz,
  UNIQUE(client_id, exercise_id)
);

ALTER TABLE client_exercise_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage client exercise status"
  ON client_exercise_status FOR ALL TO authenticated
  USING  (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ces_client_id   ON client_exercise_status(client_id);
CREATE INDEX IF NOT EXISTS idx_ces_exercise_id ON client_exercise_status(exercise_id);

-- ─── auto-update updated_at on instructor_clients ────────────────────────────
CREATE OR REPLACE FUNCTION update_instructor_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_instructor_clients_updated_at'
  ) THEN
    CREATE TRIGGER trg_instructor_clients_updated_at
      BEFORE UPDATE ON instructor_clients
      FOR EACH ROW EXECUTE FUNCTION update_instructor_clients_updated_at();
  END IF;
END $$;
