import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 bg-opacity-10 border-green-500'
      case 'error':
        return 'bg-red-500 bg-opacity-10 border-red-500'
      case 'info':
        return 'bg-blue-500 bg-opacity-10 border-blue-500'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'info':
        return 'text-blue-400'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm ${getBgColor()}`}>
        {getIcon()}
        <span className={`font-medium ${getTextColor()}`}>
          {message}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast