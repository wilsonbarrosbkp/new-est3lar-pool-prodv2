/**
 * Constantes globais da aplicação
 * Centraliza valores hardcoded para facilitar manutenção
 */

/**
 * Configuração de Pool
 */
export const POOL = {
  /** ID do pool padrão usado quando nenhum pool específico é selecionado */
  DEFAULT_ID: 1,
} as const

/**
 * Intervalos de atualização automática (em milissegundos)
 */
export const REFRESH_INTERVALS = {
  /** Intervalo padrão (1 minuto) */
  DEFAULT: 60000,
  /** Intervalo curto (30 segundos) */
  SHORT: 30000,
  /** Intervalo longo (5 minutos) */
  LONG: 300000,
} as const

/**
 * Limites de paginação e consultas
 */
export const QUERY_LIMITS = {
  /** Limite padrão para listagem de rounds */
  ROUNDS: 100,
  /** Limite padrão para listagem de pagamentos */
  PAYMENTS: 100,
  /** Limite padrão para logs de auditoria */
  AUDIT: 200,
  /** Limite de dados para pool stats (multiplicado por 2 para sampling) */
  POOL_STATS: 1,
  /** Número de itens por página em listagens gerais */
  DEFAULT_PAGE_SIZE: 50,
} as const

/**
 * Timeouts e delays em milissegundos
 */
export const TIMEOUTS = {
  /** Timeout padrão para webhooks (30 segundos) */
  WEBHOOK_DEFAULT: 30000,
  /** Delay para fechar toast de "copiado" */
  COPY_FEEDBACK: 2000,
  /** Timeout de segurança para loading de autenticação */
  AUTH_LOADING: 5000,
} as const

/**
 * Valores de truncamento para endereços
 */
export const TRUNCATE_LENGTHS = {
  /** Tamanho máximo antes de truncar endereços de wallet */
  WALLET_ADDRESS: 20,
  /** Número de caracteres no início do endereço truncado */
  WALLET_START: 10,
  /** Número de caracteres no final do endereço truncado */
  WALLET_END: 8,
} as const

/**
 * Valores percentuais e numéricos
 */
export const NUMERIC = {
  /** Valor máximo de uptime (%) */
  MAX_UPTIME: 100,
  /** Valor máximo de CPU/Memory usage (%) */
  MAX_USAGE: 100,
  /** Valor de margem para gráficos de hashrate (%) */
  CHART_MARGIN: 10,
  /** Threshold para nível de permissão crítico */
  PERMISSION_CRITICAL: 100,
  /** Threshold para nível de permissão alto */
  PERMISSION_HIGH: 50,
  /** Nível padrão de permissão */
  PERMISSION_DEFAULT: 10,
  /** Limite máximo de caracteres para campos de texto */
  MAX_CHAR_LIMIT: 10,
} as const

/**
 * Valores de UI e layout
 */
export const UI = {
  /** Altura padrão de gráficos */
  CHART_HEIGHT: 300,
  /** Largura da coluna de ações em tabelas */
  ACTION_COLUMN_WIDTH: '12',
  /** Tooltip delay (0 = instantâneo) */
  TOOLTIP_DELAY: 0,
} as const

/**
 * Mensagens padrão
 */
export const MESSAGES = {
  /** Mensagens de erro genéricas */
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    AUTH: 'Erro de autenticação',
    NOT_FOUND: 'Recurso não encontrado',
  },
  /** Mensagens de sucesso genéricas */
  SUCCESS: {
    CREATED: 'Criado com sucesso!',
    UPDATED: 'Atualizado com sucesso!',
    DELETED: 'Excluído com sucesso!',
    COPIED: 'Copiado para área de transferência',
  },
  /** Mensagens de confirmação */
  CONFIRM: {
    DELETE: 'Tem certeza que deseja excluir?',
    CANCEL: 'Tem certeza que deseja cancelar?',
  },
  /** Placeholder messages */
  PLACEHOLDER: {
    NO_DATA: 'Nenhum dado disponível',
    LOADING: 'Carregando...',
    SEARCH: 'Buscar...',
  },
} as const

/**
 * URLs de exemplo/placeholder
 */
export const URLS = {
  WEBHOOK_EXAMPLE: 'https://exemplo.com/webhook',
} as const

/**
 * Configurações de formatação
 */
export const FORMAT = {
  /** Número de casas decimais para valores decimais */
  DECIMAL_PLACES: 8,
  /** Formato de data padrão (pt-BR) */
  DATE_LOCALE: 'pt-BR',
} as const
