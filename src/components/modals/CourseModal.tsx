import React, { useEffect, useState } from 'react';
import { X, Play, MessageCircle, Clock, User, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface CourseModalProps {
  isOpen: boolean;
  courseId?: string;
  onClose: () => void;
  onAuthRequired: (mode: 'login' | 'signup') => void;
}

// Mock course data - in a real app, this would come from the database
const mockCourses = {
  '1': {
    id: '1',
    title: 'Public Speaking Mastery',
    description: 'Master the art of public speaking with proven techniques to overcome fear and speak with confidence. Learn body language, voice control, and audience engagement strategies that will transform your communication skills.',
    duration: '4 min',
    thumbnail: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ', // YouTube video ID
    category: 'Communication',
    instructor: 'Sarah Johnson',
    difficulty: 'Beginner',
    keyPoints: [
      'Overcome speaking anxiety and nervousness',
      'Master confident body language and posture',
      'Engage your audience effectively',
      'Structure compelling presentations',
      'Use voice control and pacing techniques'
    ],
    isPremium: false,
    views: '12.5k',
    rating: 4.8,
  },
  '2': {
    id: '2',
    title: 'Time Management Hacks',
    description: 'Discover powerful time management strategies that will help you get more done in less time. Learn prioritization techniques, productivity systems, and how to eliminate time-wasting activities.',
    duration: '3 min',
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ',
    category: 'Productivity',
    instructor: 'Mike Chen',
    difficulty: 'Intermediate',
    keyPoints: [
      'Priority matrix and task categorization',
      'Time blocking and calendar management',
      'Eliminate distractions and time wasters',
      'Energy management throughout the day',
      'Automation and delegation strategies'
    ],
    isPremium: true,
    views: '8.2k',
    rating: 4.9,
  },
  '3': {
    id: '3',
    title: 'Negotiation Basics',
    description: 'Learn fundamental negotiation skills that create win-win outcomes. Understand psychology, preparation strategies, and communication techniques that lead to successful negotiations.',
    duration: '5 min',
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ',
    category: 'Business',
    instructor: 'Lisa Rodriguez',
    difficulty: 'Beginner',
    keyPoints: [
      'Preparation and research strategies',
      'Understanding the other party\'s needs',
      'Creating win-win solutions',
      'Handling objections and pushback',
      'Closing and follow-up techniques'
    ],
    isPremium: false,
    views: '15.1k',
    rating: 4.7,
  },
  '4': {
    id: '4',
    title: 'Email Productivity',
    description: 'Transform your email management with proven systems and techniques. Learn inbox zero methodology, email templates, and automation strategies to save hours each week.',
    duration: '3 min',
    thumbnail: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ',
    category: 'Productivity',
    instructor: 'David Park',
    difficulty: 'Beginner',
    keyPoints: [
      'Inbox Zero methodology',
      'Email templates and signatures',
      'Filtering and automation rules',
      'Scheduling and batching emails',
      'Mobile email management'
    ],
    isPremium: true,
    views: '6.8k',
    rating: 4.6,
  },
  '5': {
    id: '5',
    title: 'Team Leadership',
    description: 'Develop essential leadership skills to inspire and guide your team to success. Learn communication, motivation, and decision-making strategies that create high-performing teams.',
    duration: '4 min',
    thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ',
    category: 'Leadership',
    instructor: 'Jennifer Kim',
    difficulty: 'Intermediate',
    keyPoints: [
      'Building trust and rapport',
      'Effective delegation strategies',
      'Motivating team members',
      'Conflict resolution techniques',
      'Performance feedback and coaching'
    ],
    isPremium: false,
    views: '11.3k',
    rating: 4.8,
  },
  '6': {
    id: '6',
    title: 'Active Listening',
    description: 'Master the art of active listening to build stronger relationships and improve communication. Learn techniques to truly understand others and respond more effectively.',
    duration: '2 min',
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    videoId: 'dQw4w9WgXcQ',
    category: 'Communication',
    instructor: 'Alex Thompson',
    difficulty: 'Beginner',
    keyPoints: [
      'Non-verbal communication cues',
      'Asking clarifying questions',
      'Paraphrasing and summarizing',
      'Avoiding interruptions and distractions',
      'Empathetic responding techniques'
    ],
    isPremium: true,
    views: '9.7k',
    rating: 4.9,
  },
};

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  courseId,
  onClose,
  onAuthRequired,
}) => {
  const { user, profile, isAuthenticated, isSupabaseReachable, connectionError } = useAuth();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Debug logging
  console.log('CourseModal: Rendering with props:', { isOpen, courseId });
  console.log('CourseModal: Modal should be visible:', isOpen);

  // Get course data
  const course = courseId ? mockCourses[courseId as keyof typeof mockCourses] : null;

  console.log('CourseModal: Course data:', course);

  // Mock user chat session data - in a real app, this would come from the database
  const userChatData = {
    chatSessionsToday: 0,
    chatLimit: isAuthenticated ? (profile?.role === 'premium' ? 3 : 1) : 0,
  };

  useEffect(() => {
    console.log('CourseModal: useEffect triggered, isOpen:', isOpen);
    
    if (isOpen) {
      console.log('CourseModal: Modal is opening, setting body overflow to hidden');
      document.body.style.overflow = 'hidden';
      setIsVideoLoading(true);
      setVideoError(false);
    } else {
      console.log('CourseModal: Modal is closing, restoring body overflow');
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChatClick = () => {
    console.log('CourseModal: Chat button clicked');
    
    if (!isSupabaseReachable) {
      console.log('CourseModal: Supabase not reachable');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('CourseModal: User not authenticated, showing signup');
      onAuthRequired('signup');
      return;
    }

    if (userChatData.chatSessionsToday >= userChatData.chatLimit) {
      console.log('CourseModal: Chat limit reached');
      // In a real app, this would show an upgrade modal or message
      return;
    }

    // Start AI chat session
    console.log('CourseModal: Starting AI chat session for course:', courseId);
    // In a real app, this would create a chat session and navigate to chat interface
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError(true);
  };

  const handleClose = () => {
    console.log('CourseModal: Close button clicked');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('CourseModal: Backdrop clicked');
      onClose();
    }
  };

  if (!isOpen || !course) {
    console.log('CourseModal: Not rendering - isOpen:', isOpen, 'course:', !!course);
    return null;
  }

  console.log('CourseModal: Rendering modal for course:', course.title);

  const isChatDisabled = !isSupabaseReachable || (isAuthenticated && userChatData.chatSessionsToday >= userChatData.chatLimit);

  return (
    <div 
      className="fixed inset-0 z-[9997] overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
        />

        {/* Modal */}
        <div 
          className="relative bg-dark-secondary rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-modal animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 rounded-lg transition-colors bg-black/50 backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              {/* Course Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-primary text-sm font-medium bg-purple-primary/10 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  {course.isPremium && (
                    <span className="bg-yellow-primary text-black px-2 py-1 rounded-lg text-xs font-semibold">
                      PLUS
                    </span>
                  )}
                </div>
              </div>

              {/* Video Section */}
              <div className="mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                  <div className="aspect-video">
                    {isVideoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-dark-tertiary">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary"></div>
                      </div>
                    )}
                    
                    {videoError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-tertiary text-center p-8">
                        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Video Unavailable</h3>
                        <p className="text-gray-400 mb-4">
                          Sorry, this video is currently unavailable. Please try again later.
                        </p>
                        <button
                          onClick={() => {
                            setVideoError(false);
                            setIsVideoLoading(true);
                          }}
                          className="bg-purple-primary hover:bg-purple-dark text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${course.videoId}?modestbranding=1&rel=0`}
                        title={course.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={handleVideoLoad}
                        onError={handleVideoError}
                      />
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-3">
                    {course.title}
                  </h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
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
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-dark-tertiary px-2 py-1 rounded">
                        {course.difficulty}
                      </span>
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
                        Have a personalized conversation about {course.title.toLowerCase()} with our AI to reinforce your learning
                      </p>
                      <div className="text-sm text-gray-300">
                        {!isSupabaseReachable ? (
                          <span className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>AI chat is temporarily unavailable due to server connection issues</span>
                          </span>
                        ) : !isAuthenticated ? (
                          <span>Sign up to start your first AI chat session</span>
                        ) : userChatData.chatSessionsToday >= userChatData.chatLimit ? (
                          <span>Daily limit reached. {profile?.role !== 'premium' ? 'Upgrade to BrevEdu Plus for more sessions.' : 'Come back tomorrow for more sessions.'}</span>
                        ) : (
                          <span>{userChatData.chatLimit - userChatData.chatSessionsToday} chat session{userChatData.chatLimit - userChatData.chatSessionsToday !== 1 ? 's' : ''} remaining today</span>
                        )}
                      </div>
                      {connectionError && (
                        <div className="text-xs text-yellow-200 mt-1">
                          {connectionError}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleChatClick}
                      className={`ml-4 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 ${
                        isChatDisabled
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-white text-purple-primary hover:bg-gray-100'
                      }`}
                      disabled={isChatDisabled}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>
                        {!isSupabaseReachable ? 'Unavailable' :
                         !isAuthenticated ? 'Start Chat' : 
                         userChatData.chatSessionsToday >= userChatData.chatLimit ? 'Limit Reached' : 'Start Chat'}
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
                      <li key={index} className="flex items-start space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-purple-primary rounded-full flex-shrink-0 mt-2" />
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