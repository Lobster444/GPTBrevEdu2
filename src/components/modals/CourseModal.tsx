import React, { useEffect, useState } from 'react';
import { X, Play, MessageCircle, Clock, User, Star, AlertCircle, Crown } from 'lucide-react';
import { useUserAccess } from '../../hooks/useUserAccess';
import { useChatSessions } from '../../hooks/useChatSessions';
import { ChatSession } from '../../types/tavus';
import ChatSetupModal from './ChatSetupModal';
import ChatSessionModal from './ChatSessionModal';
import { getCourseById } from '../../data/courses';

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
  const { role, isAuthenticated, canAccessPremiumContent, chatData } = useUserAccess();
  const { createSession, endSession } = useChatSessions();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [chatSetupModal, setChatSetupModal] = useState(false);
  const [chatSessionModal, setChatSessionModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Debug logging
  console.log('CourseModal: Rendering with props:', { isOpen, courseId });
  console.log('CourseModal: Modal should be visible:', isOpen);
  console.log('CourseModal: User access data:', { role, isAuthenticated, canAccessPremiumContent, chatData });

  // Get course data from centralized source
  const course = courseId ? getCourseById(courseId) : null;

  console.log('CourseModal: Course data:', course);

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
      // Reset chat modals when main modal closes
      setChatSetupModal(false);
      setChatSessionModal(false);
      setCurrentSession(null);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChatClick = () => {
    console.log('CourseModal: Chat button clicked');
    
    if (role === 'anonymous') {
      console.log('CourseModal: Anonymous user, showing signup');
      onAuthRequired('signup');
      return;
    }

    if (!chatData.canStartChat) {
      console.log('CourseModal: Chat limit reached');
      // Show upgrade modal or message
      return;
    }

    // Open chat setup modal
    setChatSetupModal(true);
  };

  const handleStartChat = async (input: any) => {
    try {
      setIsCreatingSession(true);
      console.log('Starting chat session with input:', input);
      
      const session = await createSession(input);
      console.log('Chat session created:', session);
      
      setCurrentSession(session);
      setChatSetupModal(false);
      setChatSessionModal(true);
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw error;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSessionEnd = async () => {
    if (currentSession) {
      try {
        await endSession(currentSession.id);
        console.log('Session ended successfully');
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    setChatSessionModal(false);
    setCurrentSession(null);
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

  // Check if user can access this specific course
  const canAccessCourse = !course.isPremium || canAccessPremiumContent;

  // Determine chat button state and message
  const getChatButtonState = () => {
    if (role === 'anonymous') {
      return {
        text: 'Sign Up to Practice with AI',
        disabled: false,
        message: 'Create a free account to start AI chat sessions',
        action: () => onAuthRequired('signup')
      };
    }

    if (!chatData.canStartChat) {
      const isUpgradeNeeded = role === 'free' && chatData.chatSessionsToday >= chatData.chatLimit;
      return {
        text: isUpgradeNeeded ? 'Upgrade for More Chats' : 'Daily Limit Reached',
        disabled: true,
        message: isUpgradeNeeded 
          ? `You've used your ${chatData.chatLimit} free chat${chatData.chatLimit > 1 ? 's' : ''} for today. Upgrade to BrevEdu Plus for more sessions.`
          : `You've reached your daily limit of ${chatData.chatLimit} chat${chatData.chatLimit > 1 ? 's' : ''}. Resets in ${chatData.timeUntilReset}`,
        action: isUpgradeNeeded ? () => window.location.href = '/brevedu-plus' : undefined
      };
    }

    return {
      text: 'Practice with AI',
      disabled: false,
      message: `${chatData.chatLimit - chatData.chatSessionsToday} chat session${chatData.chatLimit - chatData.chatSessionsToday !== 1 ? 's' : ''} remaining today`,
      action: handleChatClick
    };
  };

  const chatButtonState = getChatButtonState();

  return (
    <>
      {/* Modal Portal */}
      <div 
        className="fixed inset-0 z-[9999] overflow-y-auto"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
          aria-hidden="true"
        />

        {/* Modal Container - Centered with proper spacing */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Modal Content */}
          <div 
            className="relative bg-dark-secondary rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-modal transition-all duration-300 transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Fixed position */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 rounded-lg transition-colors bg-black/50 backdrop-blur-sm hover:bg-black/70"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto max-h-[90vh] rounded-2xl">
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Course Header */}
                <div className="flex items-center justify-between mb-6">
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
                  {/* Spacer for close button */}
                  <div className="w-10"></div>
                </div>

                {/* Premium Content Gate */}
                {course.isPremium && !canAccessCourse && (
                  <div className="bg-gradient-to-r from-yellow-primary/10 to-orange-500/10 border border-yellow-primary/20 rounded-xl p-6 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Crown className="w-6 h-6 text-yellow-primary" />
                      <h3 className="text-lg font-semibold text-white">Premium Content</h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      This course is part of BrevEdu Plus. Upgrade to access premium content and get more AI chat sessions.
                    </p>
                    <button
                      onClick={() => window.location.href = '/brevedu-plus'}
                      className="bg-yellow-primary hover:bg-yellow-dark text-black px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Upgrade to BrevEdu Plus
                    </button>
                  </div>
                )}

                {/* Video Section */}
                <div className="mb-6">
                  <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                    <div className="aspect-video">
                      {!canAccessCourse ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-tertiary text-center p-8">
                          <Crown className="w-16 h-16 text-yellow-primary mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">Premium Content</h3>
                          <p className="text-gray-400 mb-4">
                            Upgrade to BrevEdu Plus to watch this course
                          </p>
                          <button
                            onClick={() => window.location.href = '/brevedu-plus'}
                            className="bg-yellow-primary hover:bg-yellow-dark text-black px-4 py-2 rounded-lg transition-colors"
                          >
                            Upgrade Now
                          </button>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      {course.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
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
                  <div className="bg-gradient-to-r from-purple-primary to-pink-500 rounded-xl p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                          Practice with AI Coach
                        </h3>
                        <p className="text-gray-200 mb-3">
                          Have a personalized conversation about {course.title.toLowerCase()} with our AI to reinforce your learning
                        </p>
                        <div className="text-sm text-gray-300">
                          <span>{chatButtonState.message}</span>
                        </div>
                      </div>
                      <button
                        onClick={chatButtonState.action}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                          chatButtonState.disabled
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-white text-purple-primary hover:bg-gray-100'
                        }`}
                        disabled={chatButtonState.disabled}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="whitespace-nowrap">{chatButtonState.text}</span>
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

      {/* Chat Setup Modal */}
      <ChatSetupModal
        isOpen={chatSetupModal}
        onClose={() => setChatSetupModal(false)}
        onStartChat={handleStartChat}
        courseTitle={course?.title}
        courseId={course?.id}
        isLoading={isCreatingSession}
      />

      {/* Chat Session Modal */}
      <ChatSessionModal
        isOpen={chatSessionModal}
        onClose={() => setChatSessionModal(false)}
        session={currentSession}
        onSessionEnd={handleSessionEnd}
      />
    </>
  );
};

export default CourseModal;