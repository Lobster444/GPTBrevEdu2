import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Header from './Header';
import MobileNav from './MobileNav';
import CourseModal from './modals/CourseModal';
import AuthModal from './modals/AuthModal';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSupabaseReachable, connectionError, loading } = useAuth();
  const [courseModal, setCourseModal] = useState<{
    isOpen: boolean;
    courseId?: string;
  }>({ isOpen: false });
  
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({ isOpen: false, mode: 'login' });

  const [dismissedConnectionWarning, setDismissedConnectionWarning] = useState(false);

  // Function to open course modal - will be passed to child components
  const openCourseModal = (courseId: string) => {
    console.log('Layout: Opening course modal for course:', courseId);
    console.log('Layout: Setting courseModal state to:', { isOpen: true, courseId });
    setCourseModal({ isOpen: true, courseId });
  };

  // Function to close course modal
  const closeCourseModal = () => {
    console.log('Layout: Closing course modal');
    setCourseModal({ isOpen: false });
  };

  // Function to open auth modal - will be passed to child components
  const openAuthModal = (mode: 'login' | 'signup') => {
    console.log('Layout: Opening auth modal in mode:', mode);
    setAuthModal({ isOpen: true, mode });
  };

  // Function to close auth modal
  const closeAuthModal = () => {
    console.log('Layout: Closing auth modal');
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  // Show connection warning if Supabase is unreachable and loading is complete
  const showConnectionWarning = !loading && !isSupabaseReachable && !dismissedConnectionWarning;

  // Debug logging
  console.log('Layout: Current courseModal state:', courseModal);
  console.log('Layout: Current authModal state:', authModal);

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

      <Header onAuthClick={openAuthModal} />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Pass both openCourseModal and openAuthModal functions to children */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { 
              onCourseClick: openCourseModal,
              onAuthClick: openAuthModal 
            } as any);
          }
          return child;
        })}
      </main>
      
      <MobileNav />
      
      {/* Course Modal */}
      <CourseModal
        isOpen={courseModal.isOpen}
        courseId={courseModal.courseId}
        onClose={closeCourseModal}
        onAuthRequired={openAuthModal}
      />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={closeAuthModal}
        onToggleMode={() => setAuthModal(prev => ({ 
          ...prev, 
          mode: prev.mode === 'login' ? 'signup' : 'login' 
        }))}
      />
    </div>
  );
};

export default Layout;