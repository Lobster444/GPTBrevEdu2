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
- **Network Resilience**: fetch-retry for robust API calls

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── modals/         # Modal components (Auth, Course)
│   └── ui/             # Base UI components (Toast, ConnectionBanner)
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

### Supabase Connection Issues

If you see connection timeouts, "Server Offline" banners, or authentication failures:

#### 1. Environment Variables
⚠️ **Most common issue**: Missing or incorrect `.env` configuration

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual Supabase credentials
# Get them from: https://supabase.com/dashboard/project/your-project/settings/api
```

**Required format:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Restart Development Server
After updating `.env`:
```bash
npm run dev
```

#### 3. Check Supabase Project Status
- Visit [Supabase Dashboard](https://supabase.com/dashboard)
- Ensure your project is active and not paused
- Check if you've hit usage limits (free tier restrictions)

#### 4. Test Connectivity
Use the Supabase CLI to test your connection:
```bash
# Install Supabase CLI
npm install -g supabase

# Test connection (replace with your actual values)
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"
```

#### 5. Network Issues
- **VPN/Firewall**: Try disabling VPN or checking firewall settings
- **Corporate Network**: Some corporate networks block external API calls
- **DNS Issues**: Try using a different DNS server (8.8.8.8, 1.1.1.1)

#### 6. Browser Issues
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for additional error details

### Connection Banner
The app shows a connection banner when Supabase is unreachable:
- **"Server offline"**: Check your `.env` file and network connection
- **"Profile data temporarily unavailable"**: Authentication works but profile loading failed
- **Click "Retry"**: Attempts to reconnect automatically

### Database Issues

If authentication works but data loading fails:

1. **Run migrations** - Ensure all database tables exist
2. **Check RLS policies** - Verify Row Level Security is properly configured
3. **Test queries** - Use Supabase dashboard to test queries manually

### Common Error Messages

- **"VITE_SUPABASE_URL is required"**: Follow environment setup steps above
- **"Profile not found"**: Check if profiles table exists and has proper triggers
- **"Connection timeout after 5000ms"**: Network or server connectivity issue
- **"Invalid API key"**: Check your anon key in `.env` file
- **"Project not found"**: Verify your Supabase URL is correct

### Performance Optimization

The app includes several performance enhancements:
- **Automatic retries**: Network requests retry up to 3 times with exponential backoff
- **Connection pooling**: Reuses connections for better performance
- **Timeout handling**: Prevents hanging requests with 5-second timeouts
- **Graceful degradation**: App remains functional even with partial connectivity issues

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