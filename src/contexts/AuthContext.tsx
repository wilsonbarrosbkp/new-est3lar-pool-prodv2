import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

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
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
        setIsLoading(false)
      }
    }, 5000)

    // Verificar estado do localStorage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
    const storedSession = localStorage.getItem(storageKey)
    console.log('🔐 Storage key:', storageKey)
    console.log('🔐 Sessão no localStorage:', storedSession ? 'presente' : 'ausente')

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession)
        console.log('🔐 Token expira em:', parsed.expires_at ? new Date(parsed.expires_at * 1000).toISOString() : 'N/A')
        // Limpar sessão criada em outro domínio (localhost) para evitar problemas de refresh
        // TODO: Remover este bloco após resolver o problema
        console.log('🔐 Limpando sessão antiga para forçar novo login...')
        localStorage.removeItem(storageKey)
      } catch (e) {
        console.error('🔐 Erro ao parsear sessão, limpando localStorage...')
        localStorage.removeItem(storageKey)
      }
    }

    // Get initial session
    console.log('🔐 Iniciando getSession...')

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 getSession completado', { session: !!session, error })
      clearTimeout(timeoutId)
      loadingResolved.current = true
      if (error) {
        console.error('Erro em getSession:', error)
        setIsLoading(false)
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('🔐 Usuário encontrado, buscando userData...')
        fetchUserData(session.user.id)
      } else {
        console.log('🔐 Sem sessão, finalizando loading')
        setIsLoading(false)
      }
    }).catch((err) => {
      clearTimeout(timeoutId)
      loadingResolved.current = true
      console.error('🔐 Erro em getSession (catch):', err)
      setIsLoading(false)
    })

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
          setIsLoading(false)
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

      if (error) {
        console.error('Erro ao buscar userData:', error)
        setUserData(null)
      } else {
        setUserData(data)
      }
    } catch (err) {
      console.error('Erro em fetchUserData:', err)
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
