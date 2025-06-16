import React from 'react'
import { Link } from 'react-router-dom'
import { UserRole } from '../hooks/useUserAccess'

interface ProtectedLinkProps {
  to: string
  requiredRole: UserRole
  currentRole: UserRole
  onAuthRequired?: () => void
  onUpgradeRequired?: () => void
  className?: string
  children: React.ReactNode
}

const ProtectedLink: React.FC<ProtectedLinkProps> = ({
  to,
  requiredRole,
  currentRole,
  onAuthRequired,
  onUpgradeRequired,
  className,
  children
}) => {
  const hasAccess = () => {
    if (requiredRole === 'anonymous') return true
    if (requiredRole === 'free') return currentRole === 'free' || currentRole === 'premium'
    if (requiredRole === 'premium') return currentRole === 'premium'
    return false
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess()) {
      e.preventDefault()
      
      if (currentRole === 'anonymous' && requiredRole !== 'anonymous') {
        onAuthRequired?.()
      } else if (currentRole === 'free' && requiredRole === 'premium') {
        onUpgradeRequired?.()
      }
    }
  }

  if (hasAccess()) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}

export default ProtectedLink