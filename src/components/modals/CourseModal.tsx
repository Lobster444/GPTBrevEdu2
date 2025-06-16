import React, { useEffect } from 'react';
import { X, Play, MessageCircle, Clock, User, Star } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  courseId?: string;
  onClose: () => void;
  onAuthRequired: (mode: 'login' | 'signup') => void;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  courseId,
  onClose,
  onAuthRequired,
}) => {
  // Mock course data - will be replaced with actual data fetching
  const course = {
    id: courseId || '1',
    title: 'Public Speaking Mastery',
    duration: '4 min',
    thumbnail: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ', // YouTube video ID
    category: 'Communication',
    instructor: 'Sarah Johnson',
    description: 'Master the art of public speaking with proven techniques to overcome fear and speak with confidence. Learn body language, voice control, and audience engagement strategies.',
    keyPoints: [
      'Overcome speaking anxiety',
      'Master body language',
      'Engage your audience',
      'Structure compelling presentations',
    ],
    isPremium: false,
    views: '12.5k',
    rating: 4.8,
  };

  // Mock user state - will be replaced with actual auth
  const user = {
    isAuthenticated: false,
    plan: 'free',
    chatSessionsToday: 0,
    chatLimit: 1,
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChatClick = () => {
    if (!user.isAuthenticated) {
      onAuthRequired('signup');
      return;
    }

    if (user.chatSessionsToday >= user.chatLimit) {
      // Show upgrade modal or message
      return;
    }

    // Start AI chat session
    console.log('Starting AI chat session');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-dark-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-tertiary">
            <div className="flex items-center space-x-3">
              <div className="text-purple-primary text-sm font-medium">
                {course.category}
              </div>
              {course.isPremium && (
                <span className="bg-yellow-primary text-black px-2 py-1 rounded-lg text-xs font-semibold">
                  PLUS
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
            <div className="p-6">
              {/* Video Section */}
              <div className="mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${course.videoId}?modestbranding=1&rel=0`}
                      title={course.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {course.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Play className="w-4 h-4" />
                        <span>{course.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-primary" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Chat CTA */}
                <div className="bg-gradient-to-r from-purple-primary to-pink-500 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Practice with AI Coach
                      </h3>
                      <p className="text-gray-200 mb-3">
                        Have a personalized conversation about this topic with our AI to reinforce your learning
                      </p>
                      <div className="text-sm text-gray-300">
                        {user.isAuthenticated ? (
                          user.chatSessionsToday >= user.chatLimit ? (
                            <span>Daily limit reached. Upgrade to BrevEdu Plus for more sessions.</span>
                          ) : (
                            <span>{user.chatLimit - user.chatSessionsToday} chat session{user.chatLimit - user.chatSessionsToday !== 1 ? 's' : ''} remaining today</span>
                          )
                        ) : (
                          <span>Sign up to start your first AI chat session</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleChatClick}
                      className={`ml-4 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 ${
                        user.isAuthenticated && user.chatSessionsToday >= user.chatLimit
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-white text-purple-primary hover:bg-gray-100'
                      }`}
                      disabled={user.isAuthenticated && user.chatSessionsToday >= user.chatLimit}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>
                        {!user.isAuthenticated ? 'Start Chat' : 
                         user.chatSessionsToday >= user.chatLimit ? 'Limit Reached' : 'Start Chat'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">About This Course</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {course.description}
                  </p>
                  
                  <h4 className="text-md font-medium text-white mb-3">What You'll Learn:</h4>
                  <ul className="space-y-2">
                    {course.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-purple-primary rounded-full flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;