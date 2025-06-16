import React, { useState } from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import CourseModal from './modals/CourseModal';
import AuthModal from './modals/AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [courseModal, setCourseModal] = useState<{
    isOpen: boolean;
    courseId?: string;
  }>({ isOpen: false });
  
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({ isOpen: false, mode: 'login' });

  // Function to open course modal - will be passed to child components
  const openCourseModal = (courseId: string) => {
    console.log('Layout: Opening course modal for course:', courseId);
    setCourseModal({ isOpen: true, courseId });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onAuthClick={(mode) => setAuthModal({ isOpen: true, mode })} />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Pass openCourseModal function to children via React.cloneElement */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onCourseClick: openCourseModal } as any);
          }
          return child;
        })}
      </main>
      
      <MobileNav />
      
      <CourseModal
        isOpen={courseModal.isOpen}
        courseId={courseModal.courseId}
        onClose={() => setCourseModal({ isOpen: false })}
        onAuthRequired={(mode) => setAuthModal({ isOpen: true, mode })}
      />
      
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onToggleMode={() => setAuthModal(prev => ({ 
          ...prev, 
          mode: prev.mode === 'login' ? 'signup' : 'login' 
        }))}
      />
    </div>
  );
};

export default Layout;