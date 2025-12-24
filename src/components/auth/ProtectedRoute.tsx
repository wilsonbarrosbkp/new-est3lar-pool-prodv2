import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, getRedirectPathForRole, ROLES } from '@/contexts/AuthContext'
import { typography } from '@/design-system/tokens'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: number[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth()
  const location = useLocation()

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

  // Not authenticated - redirect to login
  if (!user || !userData) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(userData.role_id)

    if (!hasRequiredRole) {
      // Redirect to the appropriate page based on their actual role
      const correctPath = getRedirectPathForRole(userData.role_id)
      return <Navigate to={correctPath} replace />
    }
  }

  return <>{children}</>
}

// Pre-configured protected routes for each role
export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      {children}
    </ProtectedRoute>
  )
}

export function OrgAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORG_ADMIN]}>
      {children}
    </ProtectedRoute>
  )
}

export function MinerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ORG_ADMIN, ROLES.ORG_MINER]}>
      {children}
    </ProtectedRoute>
  )
}
