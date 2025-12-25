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

/**
 * Formata shares para exibicao compacta
 * @param shares - Numero de shares
 * @returns String formatada (ex: "1.23 G", "456.78 M", "789 K")
 */
export function formatShares(shares: number): string {
  if (!shares || !isFinite(shares)) return '0'

  if (shares >= 1e12) return `${(shares / 1e12).toFixed(2)}T`
  if (shares >= 1e9) return `${(shares / 1e9).toFixed(2)}G`
  if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`
  if (shares >= 1e3) return `${(shares / 1e3).toFixed(2)}K`
  return shares.toFixed(0)
}

/**
 * Formata segundos em uptime legivel
 * @param seconds - Tempo em segundos
 * @returns String formatada (ex: "5d 2h 30m", "2h 15m")
 */
export function formatUptime(seconds: number): string {
  if (!seconds || !isFinite(seconds) || seconds < 0) return '0m'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Formata valor em BTC
 * @param value - Valor em BTC
 * @param decimals - Casas decimais (padrao: 8)
 * @returns String formatada (ex: "0.00123456 BTC")
 */
export function formatBTC(value: number, decimals = 8): string {
  if (!isFinite(value)) return '0 BTC'
  return `${value.toFixed(decimals)} BTC`
}

/**
 * Formata valor monetario com simbolo da moeda
 * @param amount - Valor
 * @param symbol - Simbolo da moeda (ex: "BTC", "USD")
 * @param decimals - Casas decimais (padrao: 8 para crypto, 2 para fiat)
 */
export function formatAmount(amount: number, symbol: string, decimals?: number): string {
  if (!isFinite(amount)) return `0 ${symbol}`

  // Determinar decimais baseado no tipo de moeda
  const cryptoSymbols = ['BTC', 'ETH', 'LTC', 'XMR', 'DASH', 'ZEC']
  const defaultDecimals = decimals ?? (cryptoSymbols.includes(symbol.toUpperCase()) ? 8 : 2)

  return `${amount.toFixed(defaultDecimals)} ${symbol}`
}

/**
 * Formata hash de transacao para exibicao compacta
 * @param hash - Hash completo
 * @param chars - Caracteres para mostrar em cada lado (padrao: 8)
 * @returns String formatada (ex: "abc12345...xyz98765")
 */
export function formatTxHash(hash: string | null | undefined, chars = 8): string {
  if (!hash) return '-'
  if (hash.length <= chars * 2 + 3) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

/**
 * Formata endereco de carteira para exibicao compacta
 * @param address - Endereco completo
 * @param chars - Caracteres para mostrar em cada lado (padrao: 6)
 * @returns String formatada (ex: "bc1abc...xyz123")
 */
export function formatAddress(address: string | null | undefined, chars = 6): string {
  if (!address) return '-'
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

/**
 * Capitaliza a primeira letra de uma string
 * @param str - String para capitalizar
 * @returns String com primeira letra maiuscula
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Formata data e hora para exibicao completa
 * @param date - Data (string ISO ou Date)
 * @returns String formatada (ex: "25/12/2024 14:30:45")
 */
export function formatDateTime(date: string | Date | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR')
}

/**
 * Formata tempo relativo de forma compacta
 * @param date - Data (string ISO ou Date ou null)
 * @returns String formatada compacta (ex: "5s", "3m", "2h", "1d")
 */
export function formatRelativeTimeShort(date: string | Date | null): string {
  if (!date) return 'Nunca'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffSec < 60) return `${diffSec}s atrás`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m atrás`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h atrás`
  return `${Math.floor(diffSec / 86400)}d atrás`
}

/**
 * Formata hashrate com unidade especifica (para hardware com unidade definida)
 * @param hashrate - Valor numérico
 * @param unit - Unidade (ex: "TH/s", "PH/s")
 * @returns String formatada (ex: "110 TH/s")
 */
export function formatHashrateWithUnit(hashrate: number, unit: string): string {
  return `${hashrate.toLocaleString()} ${unit}`
}
