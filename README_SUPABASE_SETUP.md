# Supabase Database Setup for BrevEdu

This document explains how to set up the Supabase database for the BrevEdu application.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The database consists of the following main tables:

### 1. Profiles Table
- Stores user profile information linked to Supabase Auth
- Automatically created when a user signs up
- Fields: id, full_name, role, avatar_url, created_at, updated_at

### 2. Courses Table
- Stores course information (videos, metadata, etc.)
- Fields: id, title, description, video_url, thumbnail_url, duration, category, is_premium, is_featured, etc.

### 3. AI Chat Sessions Table
- Tracks AI chat sessions for usage limits and history
- Fields: id, user_id, course_id, topic, status, started_at, ended_at, etc.

### 4. User Course Progress Table
- Tracks user progress through courses
- Fields: id, user_id, course_id, completed, watch_time_seconds, completion_percentage, etc.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order:
   - `create_profiles_table.sql`
   - `create_courses_table.sql`
   - `create_ai_chat_sessions_table.sql`
   - `create_user_course_progress.sql`
   - `seed_sample_courses.sql` (optional, for sample data)

### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Key Features

### Automatic Profile Creation
- When a user signs up through Supabase Auth, a profile is automatically created
- The trigger function `handle_new_user()` extracts the full name from user metadata

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Courses are publicly readable when published

### Usage Limits
- Free users: 1 AI chat session per day
- Premium users: 3 AI chat sessions per day
- Functions provided to check and enforce limits

### Progress Tracking
- Automatic view count increment when users start watching courses
- Completion percentage and status tracking
- Last watched timestamps for resuming courses

## Sample Data

The `seed_sample_courses.sql` file includes sample courses for development:
- Mix of free and premium courses
- Various categories (Communication, Productivity, Business, Leadership)
- Featured courses for the homepage

## Authentication Setup

The application uses Supabase Auth with email/password authentication:
- No email verification required (disabled in Supabase settings)
- User metadata includes full name
- Automatic profile creation on signup

## Environment Variables

Make sure to set these in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing the Setup

After running the migrations:

1. Test user signup/login through your application
2. Verify that profiles are created automatically
3. Check that sample courses appear in your application
4. Test AI chat session creation and limits

## Troubleshooting

### Common Issues

1. **Migration fails**: Check that you're running migrations in the correct order
2. **RLS blocks queries**: Ensure you're authenticated when testing
3. **Profile not created**: Check that the trigger function is properly installed
4. **Environment variables**: Verify your `.env` file is properly configured

### Useful SQL Queries for Testing

```sql
-- Check if profiles are being created
SELECT * FROM profiles;

-- Check courses
SELECT * FROM courses WHERE is_published = true;

-- Check AI chat sessions
SELECT * FROM ai_chat_sessions;

-- Check user progress
SELECT * FROM user_course_progress;
```

## Next Steps

After setting up the database:

1. Test the authentication flow
2. Implement course viewing and progress tracking
3. Add AI chat session management
4. Set up billing integration for premium features
5. Add admin interface for course management (optional)