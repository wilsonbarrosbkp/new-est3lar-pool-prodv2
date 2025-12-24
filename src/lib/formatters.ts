/**
 * Funções de formatação para o Est3lar Pool
 */

/**
 * Formata hashrate para exibição humana
 * @param hashrate - Valor em H/s (hashes por segundo)
 * @returns String formatada (ex: "1.23 PH/s", "456.78 TH/s")
 */
export function formatHashrate(hashrate: number): string {
  if (hashrate === 0 || !hashrate || !isFinite(hashrate)) {
    return '0 H/s'
  }

  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s']
  let unitIndex = 0
  let value = Math.abs(hashrate)

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000
    unitIndex++
  }

  // Determinar casas decimais baseado no valor
  const decimals = value >= 100 ? 1 : value >= 10 ? 2 : 2

  return `${value.toFixed(decimals)} ${units[unitIndex]}`
}

/**
 * Formata número com separadores de milhar
 * @param num - Número a formatar
 * @param locale - Locale para formatação (padrão: pt-BR)
 */
export function formatNumber(num: number, locale = 'pt-BR'): string {
  if (!isFinite(num)) return '0'
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Formata data para exibição
 * @param date - Data (string ISO ou Date)
 * @param options - Opções de formatação
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR', options)
}

/**
 * Retorna tempo relativo (há X minutos, há X horas)
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'agora mesmo'
  }

  if (diffMin < 60) {
    return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`
  }

  if (diffHour < 24) {
    return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  }

  if (diffDay < 7) {
    return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`
  }

  return formatDate(d)
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return ''
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}
