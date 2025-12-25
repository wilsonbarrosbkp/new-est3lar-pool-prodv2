import { Navigate } from 'react-router-dom'

import { getRedirectPathForRole,useAuth } from '@/contexts/AuthContext'
import { typography } from '@/design-system/tokens'

interface PublicRouteProps {
  children: React.ReactNode
}

/**
 * PublicRoute - redirects authenticated users to their dashboard
 * Used for login, forgot-password, etc.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, userData, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className={`${typography.body.small} text-text-secondary`}>Carregando...</p>
        </div>
      </div>
    )
  }

  // If authenticated, redirect to appropriate dashboard
  if (user && userData) {
    const redirectPath = getRedirectPathForRole(userData.role_id)
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
