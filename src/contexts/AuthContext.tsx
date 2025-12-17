import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface UserData {
  id: string
  email: string
  role_id: number
  full_name?: string
  organization_id?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          setUserData(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserData(authUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role_id, full_name, organization_id')
        .eq('auth_user_id', authUserId)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      } else {
        setUserData(data)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setUserData(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUserData(null)
    setSession(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, userData, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role constants for easy reference
export const ROLES = {
  SUPER_ADMIN: 1,
  ORG_ADMIN: 2,
  ORG_MINER: 3,
} as const

// Helper to get redirect path based on role
export function getRedirectPathForRole(roleId: number): string {
  switch (roleId) {
    case ROLES.SUPER_ADMIN:
      return '/super-admin'
    case ROLES.ORG_ADMIN:
      return '/org-admin'
    case ROLES.ORG_MINER:
    default:
      return '/dashboard'
  }
}
