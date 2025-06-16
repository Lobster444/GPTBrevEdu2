import React from 'react'
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'

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

  const isEnvIssue = message.includes('.env') || message.includes('configuration')

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Connection Issue
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {message}
            </p>
            {isEnvIssue && (
              <div className="mt-3 text-xs text-amber-700 bg-amber-100 p-3 rounded border">
                <p className="font-medium mb-2">🔧 Quick Fix Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your <code className="bg-amber-200 px-1 rounded">.env</code> file exists in project root</li>
                  <li>Verify it contains valid Supabase credentials</li>
                  <li>Restart dev server: <code className="bg-amber-200 px-1 rounded">npm run dev</code></li>
                  <li>Refresh this page</li>
                </ol>
                <div className="mt-2 flex items-center space-x-2">
                  <span>Need credentials?</span>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-amber-800 hover:text-amber-900 underline"
                  >
                    Get from Supabase Dashboard
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4 flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  )
}