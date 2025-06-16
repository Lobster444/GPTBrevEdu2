import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, Play } from 'lucide-react';
import { useUserAccess } from '../hooks/useUserAccess';
import AccessGate from '../components/AccessGate';
import { courses, courseCategories, getCoursesByCategory, searchCourses } from '../data/courses';

interface CoursesProps {
  onCourseClick?: (courseId: string) => void;
  onAuthClick?: (mode: 'login' | 'signup') => void;
}

const Courses: React.FC<CoursesProps> = ({ onCourseClick, onAuthClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { role, canAccessCourses } = useUserAccess();

  // Redirect anonymous users or show access gate
  useEffect(() => {
    if (role === 'anonymous') {
      // Could redirect to home or show modal
      console.log('Anonymous user trying to access courses page');
    }
  }, [role]);

  // Get filtered courses from centralized data
  const getFilteredCourses = () => {
    let filteredCourses = getCoursesByCategory(selectedCategory);
    
    if (searchTerm.trim()) {
      filteredCourses = searchCourses(searchTerm).filter(course => 
        selectedCategory === 'all' || course.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    return filteredCourses;
  };

  const filteredCourses = getFilteredCourses();

  const handleCourseClick = (courseId: string) => {
    console.log('Courses: Course clicked:', courseId);
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AccessGate
        requiredRole="free"
        currentRole={role}
        onAuthRequired={() => onAuthClick?.('signup')}
        showMessage={false}
        fallback={
          <div className="text-center py-16">
            <div className="bg-dark-secondary rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Sign In to Access All Courses
              </h2>
              <p className="text-gray-300 mb-6">
                Create a free account to browse our complete course library and start learning new skills.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => onAuthClick?.('signup')}
                  className="w-full bg-purple-primary hover:bg-purple-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => onAuthClick?.('login')}
                  className="w-full bg-dark-tertiary hover:bg-dark-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        }
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Courses</h1>
          <p className="text-gray-300">
            Discover bite-sized lessons to master new skills
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-secondary border border-dark-tertiary rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-secondary border border-dark-tertiary rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-purple-primary transition-colors appearance-none cursor-pointer"
            >
              {courseCategories.map(category => (
                <option key={category.id} value={category.id} className="bg-dark-secondary">
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
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
                <div className="text-purple-primary text-sm font-medium mb-1 capitalize">
                  {course.category}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {course.description.length > 80 
                    ? `${course.description.substring(0, 80)}...` 
                    : course.description
                  }
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Watch & Learn</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
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

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </AccessGate>
    </div>
  );
};

export default Courses;