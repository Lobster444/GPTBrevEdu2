import React, { useState } from 'react';
import { Play, MessageCircle, ArrowRight } from 'lucide-react';

interface HomeProps {
  onCourseClick?: (courseId: string) => void;
  onAuthClick?: (mode: 'login' | 'signup') => void;
}

const Home: React.FC<HomeProps> = ({ onCourseClick, onAuthClick }) => {
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

  const handleSignUpForMoreCourses = () => {
    console.log('Home: Sign Up for More Courses clicked');
    if (onAuthClick) {
      onAuthClick('signup');
    }
  };

  return (
    <div className="min-h-screen bg-figma-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Learn Skills in 
            <span className="bg-gradient-to-r from-figma-purple-500 to-figma-purple-400 bg-clip-text text-transparent"> 5 Minutes</span>
          </h1>
          <p className="text-xl text-figma-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bite-sized video lessons with AI-powered chat to master actionable skills quickly
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-figma-gray-800 p-1.5 rounded-2xl border border-figma-gray-700">
              <button
                onClick={() => setActiveToggle('all')}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeToggle === 'all'
                    ? 'bg-gradient-to-r from-figma-purple-500 to-figma-purple-400 text-white shadow-lg shadow-figma-purple-500/25'
                    : 'text-figma-gray-300 hover:text-white hover:bg-figma-gray-700'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setActiveToggle('plus')}
                className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeToggle === 'plus'
                    ? 'bg-gradient-to-r from-figma-yellow-400 to-figma-yellow-300 text-figma-black shadow-lg shadow-figma-yellow-400/25'
                    : 'text-figma-gray-300 hover:text-white hover:bg-figma-gray-700'
                }`}
              >
                BrevEdu Plus
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button className="group bg-gradient-to-r from-figma-purple-500 to-figma-purple-400 hover:from-figma-purple-600 hover:to-figma-purple-500 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 shadow-lg shadow-figma-purple-500/25 hover:shadow-xl hover:shadow-figma-purple-500/30 hover:scale-105">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Start Learning</span>
            </button>
            <button className="group bg-figma-gray-800 hover:bg-figma-gray-700 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 border border-figma-gray-700 hover:border-figma-gray-600 hover:scale-105">
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Try AI Chat</span>
            </button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              {activeToggle === 'plus' ? 'Premium Courses' : 'Featured Courses'}
            </h2>
            <button className="text-figma-purple-400 hover:text-figma-purple-300 font-semibold flex items-center space-x-2 transition-colors group">
              <span>More Courses</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="group bg-figma-gray-900 rounded-3xl overflow-hidden hover:bg-figma-gray-800 transition-all duration-300 cursor-pointer border border-figma-gray-800 hover:border-figma-gray-700 hover:shadow-xl hover:shadow-black/20 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  {course.isPremium && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-figma-yellow-400 to-figma-yellow-300 text-figma-black px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                      PLUS
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-sm font-medium">
                    {course.duration}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-figma-purple-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                    {course.category}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-figma-purple-300 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-figma-gray-400 text-sm">Watch & Learn</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id);
                      }}
                      className="text-figma-purple-400 hover:text-figma-purple-300 transition-colors group-hover:translate-x-1"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sign Up for More Courses Button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleSignUpForMoreCourses}
              className="group bg-gradient-to-r from-figma-purple-500 to-figma-purple-400 hover:from-figma-purple-600 hover:to-figma-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 shadow-lg shadow-figma-purple-500/25 hover:shadow-xl hover:shadow-figma-purple-500/30 hover:scale-105 w-full sm:w-auto"
            >
              <span>Sign Up for More Courses</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Empty State for Plus Filter */}
        {activeToggle === 'plus' && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-figma-gray-400 mb-6">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-3 text-white">No Premium Courses Yet</h3>
              <p className="text-lg">Premium content is coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;