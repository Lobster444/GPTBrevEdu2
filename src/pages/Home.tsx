import React, { useState } from 'react';
import { Play, MessageCircle, ArrowRight } from 'lucide-react';

interface HomeProps {
  onCourseClick?: (courseId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onCourseClick }) => {
  const [activeToggle, setActiveToggle] = useState<'all' | 'plus'>('all');

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
  ];

  const filteredCourses = activeToggle === 'plus' 
    ? featuredCourses.filter(course => course.isPremium)
    : featuredCourses;

  const handleCourseClick = (courseId: string) => {
    console.log('Home: Course clicked:', courseId);
    if (onCourseClick) {
      onCourseClick(courseId);
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
        
        {/* Toggle */}
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

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <button className="bg-purple-primary hover:bg-purple-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Start Learning</span>
          </button>
          <button className="bg-dark-secondary hover:bg-dark-tertiary text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Try AI Chat</span>
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {activeToggle === 'plus' ? 'Premium Courses' : 'Featured Courses'}
          </h2>
          <button className="text-purple-primary hover:text-purple-light font-medium flex items-center space-x-1 transition-colors">
            <span>More Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

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
      </div>

      {/* Empty State for Plus Filter */}
      {activeToggle === 'plus' && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Premium Courses Yet</h3>
            <p>Premium content is coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;