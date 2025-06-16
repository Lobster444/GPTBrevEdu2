import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Header from './Header';
import MobileNav from './MobileNav';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick: (mode: 'login' | 'signup') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onAuthClick }) => {
  const { isSupabaseReachable, connectionError, loading } = useAuth();
  const [dismissedConnectionWarning, setDismissedConnectionWarning] = useState(false);

  // Show connection warning if Supabase is unreachable and loading is complete
  const showConnectionWarning = !loading && !isSupabaseReachable && !dismissedConnectionWarning;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Connection Warning Banner */}
      {showConnectionWarning && (
        <div className="bg-red-600 text-white px-4 py-3 relative z-[10000]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Server Connection Issue</p>
                <p className="text-sm opacity-90">
                  {connectionError || "We're having trouble connecting to our servers. Some features may be unavailable."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissedConnectionWarning(true)}
              className="p-1 hover:bg-red-700 rounded transition-colors"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Header onAuthClick={onAuthClick} />
      
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      
      <MobileNav />
    </div>
  );
};

export default Layout;