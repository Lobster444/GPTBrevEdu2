import React from 'react';
import { User, Settings, Crown, MessageCircle, BookOpen, TrendingUp } from 'lucide-react';

const Profile: React.FC = () => {
  // Mock user data - will be replaced with actual auth
  const user = {
    name: 'Welcome Back!',
    email: 'Sign in to access your profile',
    plan: 'free',
    isAuthenticated: false,
    stats: {
      coursesCompleted: 0,
      totalWatchTime: '0 min',
      chatSessions: 0,
      streak: 0,
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-dark-secondary rounded-2xl p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-purple-primary rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {user.name}
            </h1>
            <p className="text-gray-300 mb-3">
              {user.email}
            </p>
            <div className="flex items-center space-x-3">
              {user.isAuthenticated ? (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.plan === 'premium' 
                    ? 'bg-yellow-primary text-black' 
                    : 'bg-dark-tertiary text-gray-300'
                }`}>
                  {user.plan === 'premium' && <Crown className="w-4 h-4 mr-1" />}
                  {user.plan === 'premium' ? 'BrevEdu Plus' : 'Free Plan'}
                </span>
              ) : (
                <button className="bg-purple-primary hover:bg-purple-dark text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth State - Not Signed In */}
      {!user.isAuthenticated && (
        <div className="bg-dark-secondary rounded-2xl p-8 text-center mb-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign in to unlock your learning journey
          </h2>
          <p className="text-gray-300 mb-6">
            Track your progress, access AI chat sessions, and get personalized recommendations
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button className="bg-purple-primary hover:bg-purple-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Sign In
            </button>
            <button className="text-gray-300 hover:text-white px-6 py-3 font-medium transition-colors">
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
            {user.stats.coursesCompleted}
          </div>
          <div className="text-sm text-gray-400">Courses</div>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <MessageCircle className="w-8 h-8 text-yellow-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {user.stats.chatSessions}
          </div>
          <div className="text-sm text-gray-400">AI Chats</div>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {user.stats.totalWatchTime}
          </div>
          <div className="text-sm text-gray-400">Watch Time</div>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 text-center">
          <div className="w-8 h-8 text-orange-400 mx-auto mb-2 text-2xl">🔥</div>
          <div className="text-2xl font-bold text-white">
            {user.stats.streak}
          </div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-secondary rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-dark-tertiary rounded-xl hover:bg-dark-accent transition-colors">
            <Settings className="w-6 h-6 text-gray-400" />
            <div className="text-left">
              <div className="text-white font-medium">Account Settings</div>
              <div className="text-gray-400 text-sm">Manage your profile</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-dark-tertiary rounded-xl hover:bg-dark-accent transition-colors">
            <Crown className="w-6 h-6 text-yellow-primary" />
            <div className="text-left">
              <div className="text-white font-medium">Upgrade to Plus</div>
              <div className="text-gray-400 text-sm">Unlock premium features</div>
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
            <p>No recent activity</p>
            <p className="text-sm">Start learning to see your progress here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;