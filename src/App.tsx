import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import BrevEduPlus from './pages/BrevEduPlus';
import Profile from './pages/Profile';
import CourseModal from './components/modals/CourseModal';
import AuthModal from './components/modals/AuthModal';

function App() {
  const [courseModal, setCourseModal] = useState<{
    isOpen: boolean;
    courseId?: string;
  }>({ isOpen: false });
  
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({ isOpen: false, mode: 'login' });

  // Function to open course modal
  const openCourseModal = (courseId: string) => {
    console.log('App: Opening course modal for course:', courseId);
    setCourseModal({ isOpen: true, courseId });
  };

  // Function to close course modal
  const closeCourseModal = () => {
    console.log('App: Closing course modal');
    setCourseModal({ isOpen: false });
  };

  // Function to open auth modal
  const openAuthModal = (mode: 'login' | 'signup') => {
    console.log('App: Opening auth modal in mode:', mode);
    setAuthModal({ isOpen: true, mode });
  };

  // Function to close auth modal
  const closeAuthModal = () => {
    console.log('App: Closing auth modal');
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-primary text-white">
        <Layout onAuthClick={openAuthModal}>
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  onCourseClick={openCourseModal}
                  onAuthClick={openAuthModal}
                />
              } 
            />
            <Route 
              path="/courses" 
              element={
                <Courses 
                  onCourseClick={openCourseModal}
                  onAuthClick={openAuthModal}
                />
              } 
            />
            <Route 
              path="/brevedu-plus" 
              element={
                <BrevEduPlus 
                  onAuthClick={openAuthModal}
                />
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Profile 
                  onAuthClick={openAuthModal}
                />
              } 
            />
          </Routes>
        </Layout>
        
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
    </Router>
  );
}

export default App;