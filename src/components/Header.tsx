import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, Star, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authHelpers } from '../lib/supabase';

interface HeaderProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthClick }) => {
  const location = useLocation();
  const { user, profile, isAuthenticated, loading } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await authHelpers.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // DEBUG: Add console logs to help diagnose the issue
  console.log('Header Debug Info:', {
    loading,
    isAuthenticated,
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { full_name: profile.full_name, role: profile.role } : null
  });

  return (
    <header className="bg-dark-primary border-b border-dark-tertiary sticky top-0 z-[9999] isolate">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group relative z-10">
            <div className="bg-purple-primary p-2 rounded-xl group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white hidden sm:block">
              BrevEdu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 relative z-10">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-purple-primary text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-dark-secondary'
              }`}
            >
              Home
            </Link>
            <Link
              to="/courses"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/courses') 
                  ? 'bg-purple-primary text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-dark-secondary'
              }`}
            >
              Courses
            </Link>
            <Link
              to="/brevedu-plus"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                isActive('/brevedu-plus') 
                  ? 'bg-yellow-primary text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-dark-secondary'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>BrevEdu Plus</span>
            </Link>
          </nav>

          {/* Auth Section - Enhanced debugging and visibility */}
          <div className="flex items-center space-x-3 relative z-[10] pointer-events-auto">
            {/* DEBUG: Show loading state more clearly */}
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 animate-pulse bg-dark-secondary rounded-full border-2 border-purple-primary"></div>
                <span className="text-xs text-gray-400 hidden sm:block">Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              /* Authenticated User State */
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-300">
                    Welcome, {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                  {profile?.role === 'premium' && (
                    <span className="bg-yellow-primary text-black px-2 py-1 rounded-lg text-xs font-semibold">
                      PLUS
                    </span>
                  )}
                </div>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors hidden sm:flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-dark-secondary pointer-events-auto"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
                
                {/* Profile Link */}
                <Link
                  to="/profile"
                  className={`p-2 rounded-lg transition-colors pointer-events-auto ${
                    isActive('/profile') 
                      ? 'bg-purple-primary text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-dark-secondary'
                  }`}
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              /* Non-Authenticated User State - CRITICAL FIX */
              <div className="flex items-center space-x-3">
                {/* Sign In Button */}
                <button
                  onClick={() => onAuthClick('login')}
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors hidden sm:flex items-center px-4 py-2 rounded-lg hover:bg-dark-secondary pointer-events-auto relative"
                  style={{ 
                    zIndex: 10001,
                    backgroundColor: 'transparent',
                    border: '1px solid transparent'
                  }}
                >
                  Sign In
                </button>
                
                {/* Get Started Button */}
                <button
                  onClick={() => onAuthClick('signup')}
                  className="bg-purple-primary hover:bg-purple-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors font-semibold pointer-events-auto relative"
                  style={{ 
                    zIndex: 10001,
                    minWidth: '100px',
                    minHeight: '36px'
                  }}
                >
                  Get Started
                </button>
                
                {/* Profile Link for non-authenticated users */}
                <Link
                  to="/profile"
                  className={`p-2 rounded-lg transition-colors pointer-events-auto relative ${
                    isActive('/profile') 
                      ? 'bg-purple-primary text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-dark-secondary'
                  }`}
                  style={{ zIndex: 10001 }}
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;