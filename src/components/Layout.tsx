import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import { MobileNav } from './MobileNav'
import { ConnectionBanner } from './ui/ConnectionBanner'
import { useAuth } from '../hooks/useAuth'

export const Layout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { connectionError, isSupabaseReachable, retryConnection } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await retryConnection()
    } finally {
      setIsRetrying(false)
    }
  }

  const showConnectionBanner = !isSupabaseReachable || !!connectionError

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMobileNavToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />
      
      <MobileNav 
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ConnectionBanner
            isVisible={showConnectionBanner}
            message={connectionError || 'Server offline – check your network or .env configuration'}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout