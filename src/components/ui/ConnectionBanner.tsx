import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ConnectionBannerProps {
  isVisible: boolean
  message: string
  onRetry: () => Promise<void>
  isRetrying?: boolean
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  isVisible,
  message,
  onRetry,
  isRetrying = false
}) => {
  if (!isVisible) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Connection Issue
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  )
}