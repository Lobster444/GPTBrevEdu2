import React from 'react'
import { Lock, Crown, MessageCircle } from 'lucide-react'
import { UserRole } from '../hooks/useUserAccess'

interface AccessGateProps {
  requiredRole: UserRole
  currentRole: UserRole
  onAuthRequired?: () => void
  onUpgradeRequired?: () => void
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

const AccessGate: React.FC<AccessGateProps> = ({
  requiredRole,
  currentRole,
  onAuthRequired,
  onUpgradeRequired,
  children,
  fallback,
  showMessage = true
}) => {
  const hasAccess = () => {
    if (requiredRole === 'anonymous') return true
    if (requiredRole === 'free') return currentRole === 'free' || currentRole === 'premium'
    if (requiredRole === 'premium') return currentRole === 'premium'
    return false
  }

  if (hasAccess()) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showMessage) {
    return null
  }

  // Default access denied message
  const getAccessMessage = () => {
    if (currentRole === 'anonymous' && requiredRole !== 'anonymous') {
      return {
        icon: Lock,
        title: 'Sign In Required',
        message: 'Please sign in to access this feature',
        buttonText: 'Sign In',
        action: onAuthRequired
      }
    }

    if (currentRole === 'free' && requiredRole === 'premium') {
      return {
        icon: Crown,
        title: 'Premium Feature',
        message: 'Upgrade to BrevEdu Plus to access this feature',
        buttonText: 'Upgrade Now',
        action: onUpgradeRequired
      }
    }

    return {
      icon: Lock,
      title: 'Access Restricted',
      message: 'You do not have permission to access this feature',
      buttonText: 'Learn More',
      action: () => {}
    }
  }

  const { icon: Icon, title, message, buttonText, action } = getAccessMessage()

  return (
    <div className="bg-dark-secondary rounded-xl p-6 text-center">
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      {action && (
        <button
          onClick={action}
          className="bg-purple-primary hover:bg-purple-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}

export default AccessGate