import React, { useState, useEffect } from 'react'
import { X, Clock, MessageCircle, AlertCircle } from 'lucide-react'
import { ChatSession } from '../../types/tavus'

interface ChatSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: ChatSession | null
  onSessionEnd: () => void
}

const ChatSessionModal: React.FC<ChatSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionEnd
}) => {
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [isSessionActive, setIsSessionActive] = useState(true)

  useEffect(() => {
    if (!isOpen || !session) return

    const startTime = new Date(session.started_at).getTime()
    const maxDuration = 5 * 60 * 1000 // 5 minutes in milliseconds

    const timer = setInterval(() => {
      const now = Date.now()
      const elapsed = now - startTime
      const remaining = Math.max(0, maxDuration - elapsed)
      
      setTimeRemaining(Math.ceil(remaining / 1000))
      
      if (remaining <= 0) {
        setIsSessionActive(false)
        onSessionEnd()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, session, onSessionEnd])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndSession = () => {
    setIsSessionActive(false)
    onSessionEnd()
  }

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      <div className="flex min-h-screen items-center justify-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/90" />

        {/* Modal */}
        <div className="relative bg-dark-secondary rounded-2xl w-full max-w-4xl h-[90vh] shadow-modal animate-scale-in flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-tertiary">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-primary p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  AI Practice Session: {session.topic}
                </h2>
                <p className="text-sm text-gray-400">
                  {session.difficulty_level} • {session.user_objective}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-dark-tertiary px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-primary" />
                <span className={`font-mono text-sm ${
                  timeRemaining <= 60 ? 'text-red-400' : 'text-white'
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* End Session Button */}
              <button
                onClick={handleEndSession}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                End Session
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-gray-300 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 p-4">
            {session.result_url && isSessionActive ? (
              <iframe
                src={session.result_url}
                className="w-full h-full rounded-lg border border-dark-tertiary"
                allow="camera; microphone; fullscreen"
                title="AI Chat Session"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isSessionActive ? 'Loading AI Session...' : 'Session Ended'}
                </h3>
                <p className="text-gray-300 mb-6">
                  {isSessionActive 
                    ? 'Please wait while we connect you to your AI coach.'
                    : 'Your 5-minute practice session has ended. Great job!'
                  }
                </p>
                {!isSessionActive && (
                  <button
                    onClick={onClose}
                    className="bg-purple-primary hover:bg-purple-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Close Session
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-tertiary bg-dark-tertiary/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                <span>🎯 Goal: {session.user_objective}</span>
                <span>📊 Level: {session.difficulty_level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isSessionActive ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span>{isSessionActive ? 'Active' : 'Ended'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSessionModal