import React, { useState } from 'react';
import { Play, MessageCircle, ArrowRight } from 'lucide-react';
import { useUserAccess } from '../hooks/useUserAccess';
import { Link } from 'react-router-dom';
import AccessGate from '../components/AccessGate';

interface HomeProps {
  onCourseClick?: (courseId: string) => void;
  onAuthClick?: (mode: 'login' | 'signup') => void;
}

const Home: React.FC<HomeProps> = ({ onCourseClick, onAuthClick }) => {
  const [activeToggle, setActiveToggle] = useState<'all' | 'plus'>('all');
  const { role, isAuthenticated, canAccessPremiumContent } = useUserAccess();

  const featuredCourses = [
    {
      id: '1',
      title: 'Public Speaking Mastery',
      duration: '4 min',
      thumbnail: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
      category: 'Communication',
      isPremium: false,
    },
    {
      id: '2',
      title: 'Time Management Hacks',
      duration: '3 min',
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
      category: 'Productivity',
      isPremium: true,
    },
    {
      id: '3',
      title: 'Negotiation Basics',
      duration: '5 min',
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
      category: 'Business',
      isPremium: false,
    },
    {
      id: '4',
      title: 'Email Productivity',
      duration: '3 min',
      thumbnail: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
      category: 'Productivity',
      isPremium: true,
    },
    {
      id: '5',
      title: 'Team Leadership',
      duration: '4 min',
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
      category: 'Leadership',
      isPremium: false,
    },
    {
      id: '6',
      title: 'Active Listening',
      duration: '2 min',
      thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
      category: 'Communication',
      isPremium: true,
    },
  ];

  // Filter courses based on user role and toggle
  const getDisplayedCourses = () => {
    let coursesToShow = featuredCourses;

    // Filter by toggle (all vs plus)
    if (activeToggle === 'plus') {
      coursesToShow = coursesToShow.filter(course => course.isPremium);
    }

    // For anonymous users, only show first 3 courses
    if (role === 'anonymous') {
      coursesToShow = coursesToShow.slice(0, 3);
    }

    return coursesToShow;
  };

  const displayedCourses = getDisplayedCourses();

  const handleCourseClick = (courseId: string) => {
    console.log('Home: Course tile clicked:', courseId);
    console.log('Home: onCourseClick prop available:', !!onCourseClick);
    
    if (onCourseClick) {
      console.log('Home: Calling onCourseClick with courseId:', courseId);
      onCourseClick(courseId);
    } else {
      console.error('Home: onCourseClick prop is not available!');
    }
  };

  const handleSignUpForMoreCourses = () => {
    console.log('Home: Sign Up for More Courses clicked');
    if (onAuthClick) {
      onAuthClick('signup');
    }
  };

  const handleTryAIChat = () => {
    if (role === 'anonymous') {
      onAuthClick?.('signup');
    } else {
      // For authenticated users, this would typically open a course or chat interface
      console.log('Try AI Chat clicked for authenticated user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Learn Skills in 
          <span className="text-purple-primary"> 5 Minutes</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Bite-sized video lessons with AI-powered chat to master actionable skills quickly
        </p>
        
        {/* Toggle - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="flex items-center justify-center mb-8">
            <div className="bg-dark-secondary p-1 rounded-xl">
              <button
                onClick={() => setActiveToggle('all')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeToggle === 'all'
                    ? 'bg-purple-primary text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setActiveToggle('plus')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeToggle === 'plus'
                    ? 'bg-yellow-primary text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                BrevEdu Plus
              </button>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <button 
            onClick={() => {
              // Scroll to courses section or open first course
              const coursesSection = document.getElementById('courses-section');
              if (coursesSection) {
                coursesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-purple-primary hover:bg-purple-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Start Learning</span>
          </button>
          <button 
            onClick={handleTryAIChat}
            className="bg-dark-secondary hover:bg-dark-tertiary text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Try AI Chat</span>
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div id="courses-section" className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {activeToggle === 'plus' ? 'Premium Courses' : 
             role === 'anonymous' ? 'Featured Courses' : 'All Courses'}
          </h2>
          {isAuthenticated && (
            <Link 
              to="/courses"
              className="text-purple-primary hover:text-purple-light font-medium flex items-center space-x-1 transition-colors"
            >
              <span>More Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => {
                console.log('Course card clicked:', course.id);
                handleCourseClick(course.id);
              }}
              className="bg-dark-secondary rounded-2xl overflow-hidden hover:bg-dark-tertiary transition-colors cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                {course.isPremium && (
                  <div className="absolute top-3 right-3 bg-yellow-primary text-black px-2 py-1 rounded-lg text-xs font-semibold">
                    PLUS
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-sm">
                  {course.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="text-purple-primary text-sm font-medium mb-1">
                  {course.category}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Watch & Learn</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Arrow button clicked:', course.id);
                      handleCourseClick(course.id);
                    }}
                    className="text-purple-primary hover:text-purple-light transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sign Up for More Courses Button - Only for anonymous users */}
        {role === 'anonymous' && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSignUpForMoreCourses}
              className="bg-purple-primary hover:bg-purple-dark text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto max-w-sm"
            >
              <span>Sign Up for More Courses</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State for Plus Filter */}
      {activeToggle === 'plus' && displayedCourses.length === 0 && (
        <AccessGate
          requiredRole="premium"
          currentRole={role}
          onAuthRequired={() => onAuthClick?.('signup')}
          onUpgradeRequired={() => window.location.href = '/brevedu-plus'}
          fallback={
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
                <p>Upgrade to BrevEdu Plus to access premium courses</p>
              </div>
            </div>
          }
        >
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Premium Courses Yet</h3>
              <p>Premium content is coming soon!</p>
            </div>
          </div>
        </AccessGate>
      )}
    </div>
  );
};

export default Home;