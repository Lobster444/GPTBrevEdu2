/*
  # Create courses table

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, course title)
      - `description` (text, course description)
      - `video_url` (text, YouTube video URL or ID)
      - `thumbnail_url` (text, course thumbnail image)
      - `duration` (integer, duration in seconds)
      - `category` (text, course category)
      - `is_premium` (boolean, whether course requires premium subscription)
      - `is_featured` (boolean, whether course appears on homepage)
      - `is_published` (boolean, whether course is visible to users)
      - `view_count` (integer, number of times course has been viewed)
      - `rating` (numeric, average course rating)
      - `created_at` (timestamp, course creation date)
      - `updated_at` (timestamp, last course update)

  2. Security
    - Enable RLS on `courses` table
    - Add policy for all users to read published courses
    - Add policy for admins to manage courses (future feature)

  3. Indexes
    - Add indexes for common queries (category, is_featured, is_published)
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer NOT NULL DEFAULT 0, -- Duration in seconds
  category text NOT NULL,
  is_premium boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published courses"
  ON courses
  FOR SELECT
  USING (is_published = true);

-- Future admin policy (commented out for now)
-- CREATE POLICY "Admins can manage courses"
--   ON courses
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.role = 'admin'
--     )
--   );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_is_premium ON courses(is_premium);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Trigger to update updated_at on course changes
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();