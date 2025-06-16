/*
  # Seed sample courses

  1. Sample Data
    - Insert sample courses for development and testing
    - Mix of free and premium courses
    - Various categories and durations
    - Featured courses for homepage

  2. Categories
    - Communication
    - Productivity  
    - Business
    - Leadership
    - Personal Development
*/

-- Insert sample courses
INSERT INTO courses (
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  category,
  is_premium,
  is_featured,
  is_published
) VALUES
  (
    'Public Speaking Mastery',
    'Master the art of public speaking with proven techniques to overcome fear and speak with confidence. Learn body language, voice control, and audience engagement strategies.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    240,
    'Communication',
    false,
    true,
    true
  ),
  (
    'Time Management Hacks',
    'Get more done in less time with these proven productivity techniques. Learn to prioritize tasks, eliminate distractions, and optimize your daily workflow.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    180,
    'Productivity',
    true,
    true,
    true
  ),
  (
    'Negotiation Basics',
    'Win-win strategies that work in business and personal situations. Learn the fundamentals of effective negotiation and conflict resolution.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    300,
    'Business',
    false,
    true,
    true
  ),
  (
    'Email Productivity',
    'Master your inbox in minutes with these email management strategies. Learn to process emails efficiently and reduce email overwhelm.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    180,
    'Productivity',
    true,
    false,
    true
  ),
  (
    'Team Leadership',
    'Lead with impact and influence. Learn essential leadership skills for managing teams, making decisions, and inspiring others to achieve their best.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    240,
    'Leadership',
    false,
    false,
    true
  ),
  (
    'Active Listening',
    'Connect deeper through listening. Master the art of active listening to improve relationships, resolve conflicts, and build trust.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    120,
    'Communication',
    true,
    false,
    true
  ),
  (
    'Goal Setting Framework',
    'Turn dreams into achievable goals with this proven framework. Learn to set SMART goals, create action plans, and track your progress effectively.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    210,
    'Personal Development',
    false,
    false,
    true
  ),
  (
    'Stress Management Techniques',
    'Reduce stress and improve well-being with practical techniques. Learn breathing exercises, mindfulness practices, and stress-reduction strategies.',
    'dQw4w9WgXcQ',
    'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    270,
    'Personal Development',
    true,
    false,
    true
  );

-- Update view counts and ratings for sample data
UPDATE courses SET 
  view_count = FLOOR(RANDOM() * 10000 + 1000),
  rating = ROUND((RANDOM() * 2 + 3)::numeric, 1)
WHERE id IN (SELECT id FROM courses LIMIT 8);