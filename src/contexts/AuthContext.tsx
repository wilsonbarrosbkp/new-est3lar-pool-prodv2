import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { handleError, showErrorToast } from '@/lib/error-handler'

/**
 * Dados do usuário para o contexto de autenticação
 *
 * Tipo simplificado com apenas os campos necessários para auth/autorização.
 * Para o tipo completo com dados de relacionamento, veja User em @/types/super-admin.ts
 */
interface UserData {
  id: string
  email: string
  role_id: number
  name?: string
  organization_id?: number
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)
  const loadingResolved = useRef(false)

  useEffect(() => {
    // Evitar inicialização duplicada (React Strict Mode)
    if (initialized.current) return
    initialized.current = true

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (!loadingResolved.current) {
        console.warn('Auth timeout - finalizando loading')
        loadingResolved.current = true
        setLoading(false)
      }
    }, 5000)

    // Verificar estado do localStorage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
    const storedSession = localStorage.getItem(storageKey)

    // Tentar recuperar sessão do localStorage primeiro (mais confiável)
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession)

        // Verificar se o token ainda é válido
        const now = Math.floor(Date.now() / 1000)
        if (parsed.expires_at && parsed.expires_at > now && parsed.user) {
          clearTimeout(timeoutId)
          loadingResolved.current = true
          setSession(parsed)
          setUser(parsed.user)
          fetchUserData(parsed.user.id)
          return
        } else {
          localStorage.removeItem(storageKey)
        }
      } catch {
        localStorage.removeItem(storageKey)
      }
    }

    // Sem sessão no localStorage, finalizar loading (mostrar tela de login)
    clearTimeout(timeoutId)
    loadingResolved.current = true
    setLoading(false)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ignorar evento INITIAL_SESSION pois já tratamos com getSession
        if (event === 'INITIAL_SESSION') return

        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          setUserData(null)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserData(authUserId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role_id, name, organization_id')
        .eq('auth_user_id', authUserId)
        .single()

      if (error) throw error

      setUserData(data)
    } catch (err) {
      handleError(err, 'fetchUserData')
      // Não exibir toast aqui pois é silencioso (background)
      // Apenas log para debug
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      // Limpar localStorage manualmente para garantir
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
      localStorage.removeItem(storageKey)

      await supabase.auth.signOut()
      setUser(null)
      setUserData(null)
      setSession(null)
      window.location.href = '/login'
    } catch (err) {
      // Mesmo com erro, tentar limpar estado local
      const appError = handleError(err, 'signOut')
      showErrorToast(appError)
      setUser(null)
      setUserData(null)
      setSession(null)
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, userData, session, loading, signOut }}>
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
