/*
  # Create AI chat sessions table

  1. New Tables
    - `ai_chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `course_id` (uuid, optional reference to courses.id)
      - `topic` (text, chat session topic/subject)
      - `status` (text, session status: active, completed, failed)
      - `started_at` (timestamp, when session began)
      - `ended_at` (timestamp, when session ended)
      - `duration_seconds` (integer, actual session duration)
      - `tavus_session_id` (text, external Tavus session identifier)
      - `result_url` (text, optional URL to session recording/result)
      - `user_objective` (text, what user wanted to achieve)
      - `difficulty_level` (text, beginner, intermediate, advanced)
      - `created_at` (timestamp, record creation date)

  2. Security
    - Enable RLS on `ai_chat_sessions` table
    - Add policy for users to read their own chat sessions
    - Add policy for users to create their own chat sessions
    - Add policy for users to update their own chat sessions

  3. Functions
    - Create function to check daily chat limits based on user role
    - Create function to get user's chat sessions for today

  4. Indexes
    - Add indexes for user queries and date-based filtering
*/

-- Create ai_chat_sessions table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  topic text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  started_at timestamptz DEFAULT now() NOT NULL,
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  tavus_session_id text,
  result_url text,
  user_objective text,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own chat sessions"
  ON ai_chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
  ON ai_chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON ai_chat_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_course_id ON ai_chat_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_started_at ON ai_chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_status ON ai_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_date ON ai_chat_sessions(user_id, started_at);

-- Function to get user's daily chat limit based on role
CREATE OR REPLACE FUNCTION get_user_daily_chat_limit(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
  
  CASE user_role
    WHEN 'premium' THEN RETURN 3;
    WHEN 'free' THEN RETURN 1;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's chat sessions count for today
CREATE OR REPLACE FUNCTION get_user_daily_chat_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM ai_chat_sessions
    WHERE user_id = user_uuid
    AND started_at >= CURRENT_DATE
    AND started_at < CURRENT_DATE + INTERVAL '1 day'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can start a new chat session
CREATE OR REPLACE FUNCTION can_user_start_chat(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  daily_limit integer;
  daily_count integer;
BEGIN
  SELECT get_user_daily_chat_limit(user_uuid) INTO daily_limit;
  SELECT get_user_daily_chat_count(user_uuid) INTO daily_count;
  
  RETURN daily_count < daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;