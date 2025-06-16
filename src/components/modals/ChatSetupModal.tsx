import React, { useState } from 'react'
import { X, MessageCircle, Target, BarChart3, BookOpen } from 'lucide-react'
import { ChatSessionInput } from '../../types/tavus'
import { useToast } from '../../hooks/useToast'
import Toast from '../ui/Toast'

interface ChatSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (input: ChatSessionInput) => Promise<void>
  courseTitle?: string
  courseId?: string
  isLoading?: boolean
}

const ChatSetupModal: React.FC<ChatSetupModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  courseTitle,
  courseId,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ChatSessionInput>({
    topic: courseTitle || '',
    learningObjective: '',
    difficultyLevel: 'beginner'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { toast, showToast, hideToast } = useToast()

  const topicOptions = [
    'Public Speaking',
    'Time Management',
    'Negotiation',
    'Email Productivity',
    'Team Leadership',
    'Active Listening',
    'Goal Setting',
    'Stress Management',
    'Communication Skills',
    'Project Management'
  ]

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.topic.trim()) {
      newErrors.topic = 'Please select or enter a topic'
    }

    if (!formData.learningObjective.trim()) {
      newErrors.learningObjective = 'Please describe what you want to achieve'
    } else if (formData.learningObjective.length < 10) {
      newErrors.learningObjective = 'Please provide at least 10 characters'
    } else if (formData.learningObjective.length > 200) {
      newErrors.learningObjective = 'Please keep it under 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onStartChat({
        ...formData,
        courseId
      })
      
      // Reset form
      setFormData({
        topic: courseTitle || '',
        learningObjective: '',
        difficultyLevel: 'beginner'
      })
      setErrors({})
    } catch (error: any) {
      console.error('Error starting chat:', error)
      showToast(error.message || 'Failed to start chat session. Please try again.', 'error')
    }
  }

  const handleInputChange = (field: keyof ChatSessionInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="relative bg-dark-secondary rounded-2xl w-full max-w-md shadow-modal animate-scale-in">
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-purple-primary p-2 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    Start AI Practice Session
                  </h2>
                </div>
                <p className="text-gray-300">
                  Set up your personalized 5-minute AI coaching session
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Topic
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    disabled={isLoading}
                    className={`w-full bg-dark-tertiary border-2 ${
                      errors.topic ? 'border-red-500' : 'border-transparent focus:border-purple-primary'
                    } rounded-lg px-4 py-3 text-white focus:outline-none transition-colors disabled:opacity-50`}
                  >
                    <option value="">Select a topic...</option>
                    {topicOptions.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  {errors.topic && (
                    <p className="text-red-400 text-sm mt-1">{errors.topic}</p>
                  )}
                </div>

                {/* Learning Objective */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    What do you want to achieve? ({formData.learningObjective.length}/200)
                  </label>
                  <textarea
                    value={formData.learningObjective}
                    onChange={(e) => handleInputChange('learningObjective', e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g., I want to practice handling difficult questions during presentations..."
                    maxLength={200}
                    rows={3}
                    className={`w-full bg-dark-tertiary border-2 ${
                      errors.learningObjective ? 'border-red-500' : 'border-transparent focus:border-purple-primary'
                    } rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors disabled:opacity-50 resize-none`}
                  />
                  {errors.learningObjective && (
                    <p className="text-red-400 text-sm mt-1">{errors.learningObjective}</p>
                  )}
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleInputChange('difficultyLevel', level)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          formData.difficultyLevel === level
                            ? 'bg-purple-primary text-white'
                            : 'bg-dark-tertiary text-gray-300 hover:bg-dark-accent'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-primary hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Starting Session...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Start 5-Minute Session
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Info */}
              <div className="mt-4 p-3 bg-dark-tertiary rounded-lg">
                <p className="text-sm text-gray-300">
                  💡 Your AI coach will adapt to your level and help you practice real scenarios. 
                  The session will automatically end after 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}

export default ChatSetupModal