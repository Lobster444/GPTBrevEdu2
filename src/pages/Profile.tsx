import React from 'react';
import { User, Settings, Crown, MessageCircle, BookOpen, TrendingUp, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authHelpers } from '../lib/supabase';

const Profile: React.FC = () => {
  const { user, profile, isAuthenticated, loading, isSupabaseReachable, connectionError } = useAuth();

  const handleSignOut = async () => {
    if (!isSupabaseReachable) return;
    
    try {
      await authHelpers.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mock stats - will be replaced with real data
  const stats = {
    coursesCompleted: isSupabaseReachable ? 0 : '-',
    totalWatchTime: isSupabaseReachable ? '0 min' : '-',
    chatSessions: isSupabaseReachable ? 0 : '-',
    streak: isSupabaseReachable ? 0 : '-',
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
                <button 
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isSupabaseReachable
                      ? 'bg-purple-primary hover:bg-purple-dark text-white'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!isSupabaseReachable}
                >
                  Sign In
                </button>
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
            className={`flex items-center space-x-3 p-4 rounded-xl transition-colors ${
              isSupabaseReachable
                ? 'bg-dark-tertiary hover:bg-dark-accent'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
            disabled={!isSupabaseReachable}
          >
            <Crown className="w-6 h-6 text-yellow-primary" />
            <div className="text-left">
              <div className="text-white font-medium">Upgrade to Plus</div>
              <div className="text-gray-400 text-sm">
                {isSupabaseReachable ? 'Unlock premium features' : 'Unavailable offline'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-secondary rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {!isSupabaseReachable ? 'Activity unavailable while offline' :
               isAuthenticated ? 'No recent activity' : 'Sign in to see your activity'}
            </p>
            <p className="text-sm">
              {!isSupabaseReachable ? 'Check your connection and try again' :
               isAuthenticated ? 'Start learning to see your progress here' : 'Track your learning journey'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;