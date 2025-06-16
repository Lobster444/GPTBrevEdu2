import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, Star, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserAccess } from '../hooks/useUserAccess';
import { authHelpers } from '../lib/supabase';
import ProtectedLink from './ProtectedLink';

interface HeaderProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onAuthClick }) => {
  const location = useLocation();
  const { user, profile, isAuthenticated, loading, isSupabaseReachable, connectionError } = useAuth();
  const { role } = useUserAccess();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    if (!isSupabaseReachable) return;
    
    try {
      await authHelpers.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthRequired = () => {
    onAuthClick('signup');
  };

  const handleUpgradeRequired = () => {
    // Navigate to BrevEdu Plus page or open upgrade modal
    // For now, just navigate to the plus page
    window.location.href = '/brevedu-plus';
  };

  // DEBUG: Add console logs to help diagnose the issue
  console.log('Header Debug Info:', {
    loading,
    isAuthenticated,
    isSupabaseReachable,
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { full_name: profile.full_name, role: profile.role } : null,
    connectionError,
    userRole: role
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
            <ProtectedLink
              to="/courses"
              requiredRole="free"
              currentRole={role}
              onAuthRequired={handleAuthRequired}
              onUpgradeRequired={handleUpgradeRequired}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/courses') 
                  ? 'bg-purple-primary text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-dark-secondary'
              }`}
            >
              Courses
            </ProtectedLink>
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

          {/* Auth Section */}
          <div className="flex items-center space-x-3 relative z-[10] pointer-events-auto">
            {loading ? (
              /* Loading indicator */
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 animate-spin border-2 border-purple-primary border-t-transparent rounded-full"></div>
                <span className="text-xs text-gray-400 hidden sm:block">Loading...</span>
              </div>
            ) : !isSupabaseReachable ? (
              /* Server Offline State */
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Server Offline</span>
                <span className="text-xs sm:hidden">Offline</span>
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
                  {connectionError && (
                    <span className="text-xs text-yellow-400" title={connectionError}>
                      ⚠️
                    </span>
                  )}
                </div>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={!isSupabaseReachable}
                  className={`text-sm font-medium transition-colors hidden sm:flex items-center space-x-1 px-3 py-2 rounded-lg pointer-events-auto ${
                    isSupabaseReachable
                      ? 'text-gray-300 hover:text-white hover:bg-dark-secondary'
                      : 'text-gray-500 cursor-not-allowed'
                  }`}
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
              /* Non-Authenticated User State */
              <div className="flex items-center space-x-3">
                {/* Sign In Button */}
                <button
                  onClick={() => {
                    console.log('Sign In button clicked');
                    onAuthClick('login');
                  }}
                  disabled={!isSupabaseReachable}
                  className={`text-sm font-medium transition-colors px-4 py-2 rounded-lg pointer-events-auto relative border border-transparent ${
                    isSupabaseReachable
                      ? 'text-gray-300 hover:text-white hover:bg-dark-secondary hover:border-gray-600'
                      : 'text-gray-500 cursor-not-allowed bg-gray-800'
                  }`}
                  style={{ 
                    zIndex: 10001,
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Sign In
                </button>
                
                {/* Get Started Button */}
                <button
                  onClick={() => {
                    console.log('Get Started button clicked');
                    onAuthClick('signup');
                  }}
                  disabled={!isSupabaseReachable}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-semibold pointer-events-auto relative ${
                    isSupabaseReachable
                      ? 'bg-purple-primary hover:bg-purple-dark text-white'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                  style={{ 
                    zIndex: 10001,
                    minWidth: '100px',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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