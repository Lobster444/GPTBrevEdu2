/*
  # Create user course progress table

  1. New Tables
    - `user_course_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `course_id` (uuid, references courses.id)
      - `completed` (boolean, whether course is completed)
      - `watch_time_seconds` (integer, total time watched)
      - `completion_percentage` (integer, 0-100)
      - `last_watched_at` (timestamp, when user last watched)
      - `completed_at` (timestamp, when course was completed)
      - `created_at` (timestamp, when progress record was created)

  2. Security
    - Enable RLS on `user_course_progress` table
    - Add policy for users to read their own progress
    - Add policy for users to update their own progress

  3. Functions
    - Create function to update course view count when progress is created
    - Create function to calculate completion percentage

  4. Constraints
    - Unique constraint on user_id + course_id combination
*/

-- Create user_course_progress table
CREATE TABLE IF NOT EXISTS user_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  watch_time_seconds integer NOT NULL DEFAULT 0,
  completion_percentage integer NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  last_watched_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own progress"
  ON user_course_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_course_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_course_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_completed ON user_course_progress(completed);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_last_watched ON user_course_progress(last_watched_at DESC);

-- Function to increment course view count
CREATE OR REPLACE FUNCTION increment_course_view_count()
RETURNS trigger AS $$
BEGIN
  -- Only increment on first view (when progress record is created)
  IF TG_OP = 'INSERT' THEN
    UPDATE courses 
    SET view_count = view_count + 1 
    WHERE id = NEW.course_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment view count when progress is created
CREATE TRIGGER increment_course_views
  AFTER INSERT ON user_course_progress
  FOR EACH ROW EXECUTE FUNCTION increment_course_view_count();

-- Function to auto-update completion status
CREATE OR REPLACE FUNCTION update_completion_status()
RETURNS trigger AS $$
BEGIN
  -- Mark as completed if completion percentage reaches 100%
  IF NEW.completion_percentage >= 100 AND OLD.completed = false THEN
    NEW.completed = true;
    NEW.completed_at = now();
  END IF;
  
  -- Update last watched timestamp
  NEW.last_watched_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update completion status
CREATE TRIGGER update_progress_completion
  BEFORE UPDATE ON user_course_progress
  FOR EACH ROW EXECUTE FUNCTION update_completion_status();