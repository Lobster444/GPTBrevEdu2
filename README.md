# BrevEdu - Bite-sized Learning Platform

![Tech Stack](https://img.shields.io/badge/React-18.3.1-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-blue?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-2.39.0-green?logo=supabase)

BrevEdu is a modern learning platform that delivers bite-sized video lessons with AI-powered chat sessions to help users master actionable skills quickly. Built with React, TypeScript, Tailwind CSS, and Supabase for a seamless learning experience.

## ✨ Features

- **Bite-sized Learning**: 2-5 minute video courses on practical skills
- **AI Chat Sessions**: Practice with AI to reinforce learning
- **Premium Tiers**: Free and Plus subscription options
- **Progress Tracking**: Monitor your learning journey
- **Responsive Design**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd brevedu
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root:

```bash
# Copy the example file and edit it
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Getting your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings → API in your project dashboard
3. Copy your Project URL and anon/public key
4. Paste them into your `.env` file

### 4. Database Setup

Your Supabase project needs the following setup:

- **Authentication**: Email/password enabled (no email confirmation required)
- **Database Tables**: profiles, courses, ai_chat_sessions, user_course_progress
- **Row Level Security (RLS)**: Enabled on all tables with appropriate policies

📖 **Detailed setup instructions**: See `README_SUPABASE_SETUP.md` for complete database schema and migration files.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── modals/         # Modal components (Auth, Course)
│   └── ui/             # Base UI components (Toast, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

The app uses Supabase Auth with email/password authentication:

- **Free users**: 1 AI chat session per day
- **Premium users**: 3 AI chat sessions per day
- **Anonymous users**: Can browse courses, must sign up for AI chat

## 🚨 Troubleshooting

⚠️ **If you see "VITE_SUPABASE_URL is required" error:**

1. **Copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in values from Supabase Dashboard**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to Project Settings → API
   - Copy your Project URL and anon/public key
   - Paste them into your `.env` file

3. **Restart development server**:
   ```bash
   npm run dev
   ```

### Connection Issues

If you see "Server Offline" or connection timeouts:

1. **Check your `.env` file** - Ensure valid Supabase credentials
2. **Verify Supabase project status** - Check if your project is active
3. **Restart dev server** - After updating environment variables
4. **Check project limits** - Free tier has usage limits
5. **Use the Retry button** - Click the retry button in the connection warning banner

### Testing Connection

To test your Supabase connection:

1. **Ensure `.env` exists and VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set**
2. **Restart dev server**: `npm run dev`
3. **Check browser console** for connection logs
4. **Troubleshoot**: network firewalls, VPN issues, etc.

You can also test connectivity using the Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Test connection (replace with your project URL)
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"
```

### Database Issues

If authentication or data loading fails:

1. **Run migrations** - Ensure all database tables exist
2. **Check RLS policies** - Verify Row Level Security is properly configured
3. **Test connection** - Use Supabase dashboard to test queries

### Common Fixes

- **"Environment variables missing"**: Copy `.env.example` to `.env` and add your credentials
- **"Profile not found"**: Check if the profiles table exists and has proper triggers
- **"Infinite loading"**: Usually indicates Supabase connection issues
- **"VITE_SUPABASE_URL is required"**: Follow the troubleshooting steps above

## 📚 Additional Documentation

- `README_SUPABASE_SETUP.md` - Complete database setup guide
- `README_SUPABASE_URGENT_FIX.md` - Troubleshooting connection issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Need help?** Check the troubleshooting section above or review the Supabase setup documentation.