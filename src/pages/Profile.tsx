import React from 'react';
import { User, Settings, Crown, MessageCircle, BookOpen, TrendingUp, LogOut, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserAccess } from '../hooks/useUserAccess';
import { useChatSessions } from '../hooks/useChatSessions';
import { authHelpers } from '../lib/supabase';

interface ProfileProps {
  onAuthClick?: (mode: 'login' | 'signup') => void;
}

const Profile: React.FC<ProfileProps> = ({ onAuthClick }) => {
  const { user, profile, isAuthenticated, loading, isSupabaseReachable, connectionError } = useAuth();
  const { role, chatData } = useUserAccess();
  const { sessions, loading: sessionsLoading } = useChatSessions();

  const handleSignOut = async () => {
    if (!isSupabaseReachable) return;
    
    try {
      await authHelpers.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    if (onAuthClick) {
      onAuthClick(mode);
    }
  };

  // Calculate stats from actual data
  const stats = {
    coursesCompleted: isSupabaseReachable ? 0 : '-', // TODO: Implement course completion tracking
    totalWatchTime: isSupabaseReachable ? '0 min' : '-', // TODO: Implement watch time tracking
    chatSessions: isSupabaseReachable ? sessions.length : '-',
    streak: isSupabaseReachable ? 0 : '-', // TODO: Implement streak tracking
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-dark-secondary rounded-2xl p-6 mb-8 animate-pulse">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-dark-tertiary rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-dark-tertiary rounded mb-2 w-48"></div>
              <div className="h-4 bg-dark-tertiary rounded mb-3 w-64"></div>
              <div className="h-6 bg-dark-tertiary rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Connection Status Warning */}
      {!isSupabaseReachable && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Connection Issue</p>
            <p className="text-xs mt-1">
              {connectionError || 'Unable to connect to our servers. Profile data and actions may be unavailable.'}
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-dark-secondary rounded-2xl p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-purple-primary rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {isAuthenticated ? (profile?.full_name || 'User') : 'Welcome to BrevEdu!'}
            </h1>
            <p className="text-gray-300 mb-3">
              {isAuthenticated ? user?.email : 'Sign in to access your profile and track your learning progress'}
            </p>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.role === 'premium' 
                      ? 'bg-yellow-primary text-black' 
                      : 'bg-dark-tertiary text-gray-300'
                  }`}>
                    {profile?.role === 'premium' && <Crown className="w-4 h-4 mr-1" />}
                    {profile?.role === 'premium' ? 'BrevEdu Plus' : 'Free Plan'}
                  </span>
                  {/* Chat Usage Indicator */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-primary/20 text-purple-primary">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {chatData.chatSessionsToday}/{chatData.chatLimit} chats today
                  </span>
                  <button
                    onClick={handleSignOut}
                    disabled={!isSupabaseReachable}
                    className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                      isSupabaseReachable
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isSupabaseReachable
                        ? 'bg-purple-primary hover:bg-purple-dark text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!isSupabaseReachable}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleAuthClick('signup')}
                    className={`px-6 py-2 font-medium transition-colors ${
                      isSupabaseReachable
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isSupabaseReachable}
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth State - Not Signed In */}
      {!isAuthenticated && (
        <div className="bg-dark-secondary rounded-2xl p-8 text-center mb-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign in to unlock your learning journey
          </h2>
          <p className="text-gray-300 mb-6">
            Track your progress, access AI chat sessions, and get personalized recommendations
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => handleAuthClick('login')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSupabaseReachable
                  ? 'bg-purple-primary hover:bg-purple-dark text-white'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
              disabled={!isSupabaseReachable}
            >
              Sign In
            </button>
            <button 
              onClick={() => handleAuthClick('signup')}
              className={`px-6 py-3 font-medium transition-colors ${
                isSupabaseReachable
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isSupabaseReachable}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <BookOpen className="w-8 h-8 text-purple-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {stats.coursesCompleted}
          </div>
          <div className="text-sm text-gray-400">Courses</div>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <MessageCircle className="w-8 h-8 text-yellow-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {stats.chatSessions}
          </div>
          <div className="text-sm text-gray-400">AI Chats</div>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {stats.totalWatchTime}
          </div>
          <div className="text-sm text-gray-400">Watch Time</div>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <div className="w-8 h-8 text-orange-400 mx-auto mb-2 text-2xl">🔥</div>
          <div className="text-2xl font-bold text-white">
            {stats.streak}
          </div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
      </div>

      {/* Chat Usage Status */}
      {isAuthenticated && (
        <div className="bg-dark-secondary rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">AI Chat Usage</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300">
                Today's Usage: {chatData.chatSessionsToday} of {chatData.chatLimit} sessions
              </p>
              <p className="text-sm text-gray-400">
                Resets in {chatData.timeUntilReset}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {chatData.canStartChat ? 'Available' : 'Limit Reached'}
              </span>
            </div>
          </div>
          <div className="w-full bg-dark-tertiary rounded-full h-2">
            <div 
              className="bg-purple-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(chatData.chatSessionsToday / chatData.chatLimit) * 100}%` 
              }}
            />
          </div>
          {role === 'free' && chatData.chatSessionsToday >= chatData.chatLimit && (
            <div className="mt-4 p-3 bg-yellow-primary/10 border border-yellow-primary/20 rounded-lg">
              <p className="text-sm text-yellow-primary">
                💡 Upgrade to BrevEdu Plus for 3 AI chat sessions per day instead of 1!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-dark-secondary rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            className={`flex items-center space-x-3 p-4 rounded-xl transition-colors ${
              isSupabaseReachable
                ? 'bg-dark-tertiary hover:bg-dark-accent'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
            disabled={!isSupabaseReachable}
          >
            <Settings className="w-6 h-6 text-gray-400" />
            <div className="text-left">
              <div className="text-white font-medium">Account Settings</div>
              <div className="text-gray-400 text-sm">
                {isSupabaseReachable ? 'Manage your profile' : 'Unavailable offline'}
              </div>
            </div>
          </button>
          <button 
            onClick={() => window.location.href = '/brevedu-plus'}
            className={`flex items-center space-x-3 p-4 rounded-xl transition-colors ${
              isSupabaseReachable
                ? 'bg-dark-tertiary hover:bg-dark-accent'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
            disabled={!isSupabaseReachable}
          >
            <Crown className="w-6 h-6 text-yellow-primary" />
            <div className="text-left">
              <div className="text-white font-medium">
                {role === 'premium' ? 'Manage Plus' : 'Upgrade to Plus'}
              </div>
              <div className="text-gray-400 text-sm">
                {isSupabaseReachable 
                  ? (role === 'premium' ? 'Manage your subscription' : 'Unlock premium features')
                  : 'Unavailable offline'
                }
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Chat Sessions */}
      <div className="bg-dark-secondary rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent AI Chat Sessions</h2>
        {!isSupabaseReachable ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
            <p className="text-gray-400">Chat history unavailable while offline</p>
            <p className="text-sm text-gray-500">Check your connection and try again</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
            <p className="text-gray-400">Sign in to see your chat history</p>
            <p className="text-sm text-gray-500">Track your AI practice sessions</p>
          </div>
        ) : sessionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-dark-tertiary rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
            <p className="text-gray-400">No chat sessions yet</p>
            <p className="text-sm text-gray-500">Start learning to see your AI practice sessions here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="bg-dark-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{session.topic}</h3>
                    <p className="text-sm text-gray-400">{session.user_objective}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.started_at).toLocaleDateString()} • {session.difficulty_level}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      session.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                      session.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {session.status}
                    </span>
                    {session.duration_seconds && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor(session.duration_seconds / 60)}:{(session.duration_seconds % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;