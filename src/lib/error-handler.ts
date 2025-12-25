import { toast } from 'sonner'
import type { AuthError } from '@supabase/supabase-js'

/**
 * Tipos de erro da aplicação
 */
export type AppErrorType =
  | 'auth'
  | 'database'
  | 'validation'
  | 'network'
  | 'unknown'

/**
 * Interface para erros estruturados da aplicação
 */
export interface AppError {
  type: AppErrorType
  message: string
  originalError?: unknown
  context?: string
}

/**
 * Mensagens de erro padrão por tipo
 */
const DEFAULT_ERROR_MESSAGES: Record<AppErrorType, string> = {
  auth: 'Erro de autenticação',
  database: 'Erro ao acessar o banco de dados',
  validation: 'Dados inválidos',
  network: 'Erro de conexão',
  unknown: 'Erro inesperado',
}

/**
 * Verifica se o erro é do Supabase Auth
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'message' in error &&
    ('status' in error || 'code' in error)
  )
}

/**
 * Verifica se o erro é do Supabase (PostgrestError)
 */
export function isSupabaseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}

/**
 * Verifica se é um erro de rede
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout')
    )
  }
  return false
}

/**
 * Detecta o tipo de erro e retorna uma mensagem amigável
 */
function getErrorType(error: unknown): AppErrorType {
  // Erro de autenticação
  if (isAuthError(error)) {
    return 'auth'
  }

  // Erro do Supabase (database)
  if (isSupabaseError(error)) {
    return 'database'
  }

  // Erro de rede
  if (isNetworkError(error)) {
    return 'network'
  }

  // Erro de validação (ZodError ou similar)
  if (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error
  ) {
    return 'validation'
  }

  return 'unknown'
}

/**
 * Extrai mensagem de erro amigável
 */
function extractErrorMessage(error: unknown, type: AppErrorType): string {
  // Mensagens específicas de auth
  if (isAuthError(error)) {
    const authError = error as AuthError
    if (authError.message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos'
    }
    if (authError.message.includes('Email not confirmed')) {
      return 'Por favor, confirme seu email antes de fazer login'
    }
    if (authError.message.includes('User already registered')) {
      return 'Este email já está cadastrado'
    }
    return authError.message || DEFAULT_ERROR_MESSAGES.auth
  }

  // Mensagens específicas de database (Supabase)
  if (isSupabaseError(error)) {
    const dbError = error as { message?: string; code?: string; details?: string }

    // Erros de constraint/validação
    if (dbError.code === '23505') {
      return 'Este registro já existe no sistema'
    }
    if (dbError.code === '23503') {
      return 'Não é possível excluir: existem registros relacionados'
    }
    if (dbError.code === 'PGRST116') {
      return 'Nenhum registro encontrado'
    }

    return dbError.message || DEFAULT_ERROR_MESSAGES.database
  }

  // Mensagem de erro genérica
  if (error instanceof Error) {
    return error.message
  }

  // String como erro
  if (typeof error === 'string') {
    return error
  }

  return DEFAULT_ERROR_MESSAGES[type]
}

/**
 * Função principal de tratamento de erros
 * Detecta o tipo de erro e retorna AppError estruturado
 *
 * @param error - Erro capturado no catch
 * @param context - Contexto opcional para debug (ex: 'fetchUserData', 'createOrganization')
 * @returns AppError estruturado
 */
export function handleError(error: unknown, context?: string): AppError {
  const type = getErrorType(error)
  const message = extractErrorMessage(error, type)

  // Log para debug (em produção pode ser removido ou enviado para serviço de logging)
  if (context) {
    console.error(`[${type.toUpperCase()}] ${context}:`, error)
  } else {
    console.error(`[${type.toUpperCase()}]:`, error)
  }

  return {
    type,
    message,
    originalError: error,
    context,
  }
}

/**
 * Exibe toast de erro ao usuário
 *
 * @param error - AppError estruturado
 */
export function showErrorToast(error: AppError): void {
  toast.error(error.message)
}

