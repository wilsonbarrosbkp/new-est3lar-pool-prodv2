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
 * Formata hashrate com placeholder para loading
 */
export function formatHashrateWithPlaceholder(
  hashrate: number | undefined | null,
  placeholder = '---'
): string {
  if (hashrate === undefined || hashrate === null) {
    return placeholder
  }
  return formatHashrate(hashrate)
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
 * Formata número compacto (1K, 1M, etc)
 */
export function formatCompactNumber(num: number, locale = 'pt-BR'): string {
  if (!isFinite(num)) return '0'
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

/**
 * Formata valor monetário
 * @param value - Valor numérico
 * @param currency - Código da moeda (BRL, USD, EUR, BTC)
 * @param locale - Locale para formatação
 */
export function formatCurrency(
  value: number,
  currency = 'BRL',
  locale = 'pt-BR'
): string {
  if (!isFinite(value)) return '0'

  // Tratamento especial para criptomoedas
  if (currency === 'BTC') {
    return `₿ ${value.toFixed(8)}`
  }

  if (currency === 'ETH') {
    return `Ξ ${value.toFixed(6)}`
  }

  // Moedas fiat
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
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
 * Formata data e hora
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata data e hora com segundos
 */
export function formatDateTimeFull(date: string | Date): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
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
 * Formata porcentagem
 */
export function formatPercent(value: number, decimals = 2): string {
  if (!isFinite(value)) return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Formata bytes para exibição humana
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let unitIndex = 0
  let value = Math.abs(bytes)

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`
}

/**
 * Trunca endereço de carteira para exibição
 * @param address - Endereço completo
 * @param startChars - Caracteres no início (padrão: 6)
 * @param endChars - Caracteres no final (padrão: 4)
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
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

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return ''
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }

  return phone
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  if (!cep) return ''
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/**
 * Converte string para número de forma segura
 */
export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return isNaN(num) ? 0 : num
  }
  return 0
}

/**
 * Formata duração em segundos para formato legível
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours}h`)
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`)
  }

  return parts.join(' ')
}

/**
 * Formata uptime em porcentagem
 */
export function formatUptime(uptime: number): string {
  if (!isFinite(uptime) || uptime < 0) return 'N/A'
  if (uptime > 100) uptime = 100
  return `${uptime.toFixed(2)}%`
}
