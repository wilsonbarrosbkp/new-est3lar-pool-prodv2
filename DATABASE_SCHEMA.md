# Análise de Banco de Dados - Est3lar Pool v2

Este documento descreve a estrutura de banco de dados SQL necessária para o sistema Est3lar Pool v2, baseado na análise do sidebar e tipos TypeScript do projeto.

---

## Sumário

1. [Visão Geral das Entidades](#visão-geral-das-entidades)
2. [Diagrama de Relacionamentos](#diagrama-de-relacionamentos)
3. [Tabelas e Colunas](#tabelas-e-colunas)
4. [Índices Recomendados](#índices-recomendados)
5. [Políticas RLS (Row Level Security)](#políticas-rls)
6. [Triggers e Functions](#triggers-e-functions)
7. [Views Úteis](#views-úteis)

---

## Visão Geral das Entidades

| # | Módulo do Sidebar | Tabela Principal | Tabelas Relacionadas |
|---|-------------------|------------------|----------------------|
| 1 | Dashboard | - | Agregações de todas as tabelas |
| 2 | Organizações | `organizations` | - |
| 3 | Usuários | `users` | `auth.users`, `organizations`, `roles` |
| 4 | Permissões | `roles` | `permissions`, `role_permissions` |
| 5 | Moedas | `currencies` | - |
| 6 | Pools | `pools` | `organizations`, `payout_models`, `currencies` |
| 7 | Carteiras | `wallets` | `organizations`, `currencies` |
| 8 | Hardware | `hardware` | `organizations` |
| 9 | Workers | `workers` | `hardware`, `organizations`, `pools` |
| 10 | Pagamentos | `payments` | `organizations`, `wallets`, `currencies`, `pools` |
| 11 | Revenue | `revenue_reports` | `organizations`, `pools` |
| 12 | Auditoria | `audit_logs` | `organizations`, `users` |
| 13 | Endpoints | `endpoints` | `organizations` |
| 14 | Rounds | `rounds` | `pools` |
| 15 | Webhooks | `webhooks` | `organizations`, `webhook_events` |

**Tabelas Auxiliares:**
- `payout_models` - Modelos de pagamento (PPS, PPLNS, PROP)
- `pool_stats` - Estatísticas de mineração dos pools
- `webhook_deliveries` - Log de entregas de webhooks
- `worker_stats_history` - Histórico de estatísticas dos workers (para gráficos)
- `payment_rounds` - Relação N:N entre pagamentos e rounds

---

## Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUTENTICAÇÃO                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│  │  auth.users  │────────▶│    users     │────────▶│    roles     │        │
│  │  (Supabase)  │         │              │         │  (+ level)   │        │
│  └──────────────┘         └──────┬───────┘         └──────┬───────┘        │
│                                  │                        │                 │
│                                  │                        ▼                 │
│                                  │                 ┌──────────────┐        │
│                                  │                 │    role_     │        │
│                                  │                 │ permissions  │        │
│                                  │                 └──────┬───────┘        │
│                                  │                        │                 │
│                                  │                        ▼                 │
│                                  │                 ┌──────────────┐        │
│                                  │                 │ permissions  │        │
│                                  │                 └──────────────┘        │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORGANIZAÇÕES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          ┌──────────────────┐                               │
│                          │  organizations   │                               │
│                          └────────┬─────────┘                               │
│                                   │                                          │
│         ┌─────────────────────────┼─────────────────────────┐               │
│         │                         │                         │               │
│         ▼                         ▼                         ▼               │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│  │   wallets    │         │    pools     │         │   hardware   │        │
│  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘        │
│         │                        │                        │                 │
│         │                        │                        │                 │
│         ▼                        ▼                        ▼                 │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│  │  currencies  │         │payout_models │         │   workers    │        │
│  └──────────────┘         └──────────────┘         └──────────────┘        │
│                                  │                                          │
│                                  ▼                                          │
│                          ┌──────────────┐                                   │
│                          │    rounds    │                                   │
│                          └──────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              OPERACIONAL                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   payments   │  │  endpoints   │  │   webhooks   │  │  audit_logs  │    │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  └──────────────┘    │
│                                             │                               │
│                                             ▼                               │
│                                      ┌──────────────┐                       │
│                                      │webhook_deliv.│                       │
│                                      └──────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ESTATÍSTICAS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐                                  │
│  │  pool_stats  │         │revenue_reports│                                 │
│  └──────────────┘         └──────────────┘                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tabelas e Colunas

### 1. `permissions` - Permissões do Sistema

```sql
CREATE TABLE permissions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    module          VARCHAR(50) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(module, action)
);

-- Exemplo de permissões
INSERT INTO permissions (name, module, action, description) VALUES
    ('organizations.view', 'organizations', 'view', 'Visualizar organizações'),
    ('organizations.create', 'organizations', 'create', 'Criar organizações'),
    ('organizations.update', 'organizations', 'update', 'Atualizar organizações'),
    ('organizations.delete', 'organizations', 'delete', 'Deletar organizações'),
    ('users.view', 'users', 'view', 'Visualizar usuários'),
    ('users.create', 'users', 'create', 'Criar usuários'),
    ('users.update', 'users', 'update', 'Atualizar usuários'),
    ('users.delete', 'users', 'delete', 'Deletar usuários'),
    ('pools.view', 'pools', 'view', 'Visualizar pools'),
    ('pools.manage', 'pools', 'manage', 'Gerenciar pools'),
    ('workers.view', 'workers', 'view', 'Visualizar workers'),
    ('workers.manage', 'workers', 'manage', 'Gerenciar workers'),
    ('payments.view', 'payments', 'view', 'Visualizar pagamentos'),
    ('payments.process', 'payments', 'process', 'Processar pagamentos'),
    ('audit.view', 'audit', 'view', 'Visualizar logs de auditoria'),
    ('settings.manage', 'settings', 'manage', 'Gerenciar configurações');
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(100) | NOT NULL | - | Nome único (module.action) |
| description | TEXT | NULL | - | Descrição da permissão |
| module | VARCHAR(50) | NOT NULL | - | Módulo do sistema |
| action | VARCHAR(50) | NOT NULL | - | Ação permitida |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 2. `roles` - Roles/Papéis

```sql
CREATE TABLE roles (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    level           INTEGER NOT NULL DEFAULT 0,
    badge_color     VARCHAR(20) DEFAULT '#6366f1',
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT roles_level_check CHECK (level >= 0 AND level <= 100)
);

-- Dados iniciais
INSERT INTO roles (name, description, level, is_system) VALUES
    ('Super Admin', 'Administrador do sistema com acesso total', 100, TRUE),
    ('Org Admin', 'Administrador da organização', 50, TRUE),
    ('Org Miner', 'Minerador da organização', 10, TRUE);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(100) | NOT NULL | - | Nome único da role |
| description | TEXT | NULL | - | Descrição |
| level | INTEGER | NOT NULL | 0 | Nível hierárquico (0-100). Super Admin=100, Org Admin=50, Org Miner=10 |
| badge_color | VARCHAR(20) | NULL | #6366f1 | Cor do badge na UI |
| is_system | BOOLEAN | NOT NULL | FALSE | Se é role do sistema (não pode ser deletada) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 3. `role_permissions` - Associação Role-Permissão

```sql
CREATE TABLE role_permissions (
    id              SERIAL PRIMARY KEY,
    role_id         INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(role_id, permission_id)
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| role_id | INTEGER | NOT NULL | - | FK para roles |
| permission_id | INTEGER | NOT NULL | - | FK para permissions |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 4. `organizations` - Organizações

```sql
CREATE TABLE organizations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    cnpj            VARCHAR(18) UNIQUE,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(2),
    zip_code        VARCHAR(10),
    kwh_rate        DECIMAL(10, 4),
    base_currency   VARCHAR(10) DEFAULT 'BRL',
    status          VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT organizations_status_check CHECK (status IN ('ativo', 'inativo'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(255) | NOT NULL | - | Nome da organização |
| cnpj | VARCHAR(18) | NULL | - | CNPJ único |
| email | VARCHAR(255) | NULL | - | Email de contato |
| phone | VARCHAR(20) | NULL | - | Telefone |
| address | TEXT | NULL | - | Endereço completo |
| city | VARCHAR(100) | NULL | - | Cidade |
| state | VARCHAR(2) | NULL | - | UF |
| zip_code | VARCHAR(10) | NULL | - | CEP |
| kwh_rate | DECIMAL(10,4) | NULL | - | Custo kWh |
| base_currency | VARCHAR(10) | NULL | BRL | Moeda base |
| status | VARCHAR(20) | NOT NULL | ativo | Status |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 5. `users` - Usuários

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      TEXT,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    role_id         INTEGER NOT NULL REFERENCES roles(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT users_status_check CHECK (status IN ('ativo', 'inativo'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| auth_user_id | UUID | NOT NULL | - | FK para auth.users |
| email | VARCHAR(255) | NOT NULL | - | Email |
| name | VARCHAR(255) | NOT NULL | - | Nome completo |
| phone | VARCHAR(20) | NULL | - | Telefone |
| avatar_url | TEXT | NULL | - | URL do avatar |
| organization_id | INTEGER | NULL | - | FK para organizations |
| role_id | INTEGER | NOT NULL | - | FK para roles |
| status | VARCHAR(20) | NOT NULL | ativo | Status |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 6. `currencies` - Moedas

```sql
CREATE TABLE currencies (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    symbol          VARCHAR(10) NOT NULL UNIQUE,
    type            VARCHAR(20) NOT NULL,
    decimals        INTEGER NOT NULL DEFAULT 8,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT currencies_type_check CHECK (type IN ('crypto', 'fiat'))
);

-- Dados iniciais
INSERT INTO currencies (name, symbol, type, decimals) VALUES
    ('Bitcoin', 'BTC', 'crypto', 8),
    ('Ethereum', 'ETH', 'crypto', 18),
    ('Real Brasileiro', 'BRL', 'fiat', 2),
    ('Dólar Americano', 'USD', 'fiat', 2);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(100) | NOT NULL | - | Nome da moeda |
| symbol | VARCHAR(10) | NOT NULL | - | Símbolo (BTC, ETH) |
| type | VARCHAR(20) | NOT NULL | - | crypto ou fiat |
| decimals | INTEGER | NOT NULL | 8 | Casas decimais |
| is_active | BOOLEAN | NOT NULL | TRUE | Se está ativa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 7. `payout_models` - Modelos de Pagamento

```sql
CREATE TABLE payout_models (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO payout_models (name, description) VALUES
    ('PPS', 'Pay Per Share - Pagamento fixo por share aceita'),
    ('PPLNS', 'Pay Per Last N Shares - Pagamento baseado nas últimas N shares'),
    ('PROP', 'Proportional - Pagamento proporcional às shares contribuídas');
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(50) | NOT NULL | - | Nome do modelo |
| description | TEXT | NULL | - | Descrição |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 8. `pools` - Pools de Mineração

```sql
CREATE TABLE pools (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    organization_id     INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    currency_id         INTEGER NOT NULL REFERENCES currencies(id),
    payout_model_id     INTEGER NOT NULL REFERENCES payout_models(id),
    pool_fee_percent    DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    min_payout          DECIMAL(20, 8) DEFAULT 0.001,
    stratum_url         VARCHAR(255),
    stratum_port        INTEGER,
    stratum_difficulty  DECIMAL(20, 8),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,

    CONSTRAINT pools_fee_check CHECK (pool_fee_percent >= 0 AND pool_fee_percent <= 100)
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(255) | NOT NULL | - | Nome do pool |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| currency_id | INTEGER | NOT NULL | - | FK para currencies (moeda minerada) |
| payout_model_id | INTEGER | NOT NULL | - | FK para payout_models |
| pool_fee_percent | DECIMAL(5,2) | NOT NULL | 0.00 | Taxa do pool (%) |
| min_payout | DECIMAL(20,8) | NULL | 0.001 | Pagamento mínimo |
| stratum_url | VARCHAR(255) | NULL | - | URL do servidor stratum |
| stratum_port | INTEGER | NULL | - | Porta do stratum |
| stratum_difficulty | DECIMAL(20,8) | NULL | - | Dificuldade inicial |
| is_active | BOOLEAN | NOT NULL | TRUE | Se está ativo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 9. `wallets` - Carteiras

```sql
CREATE TABLE wallets (
    id              SERIAL PRIMARY KEY,
    address         VARCHAR(255) NOT NULL,
    label           VARCHAR(100) NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    currency_id     INTEGER NOT NULL REFERENCES currencies(id),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    UNIQUE(address, currency_id, organization_id)
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| address | VARCHAR(255) | NOT NULL | - | Endereço da carteira |
| label | VARCHAR(100) | NOT NULL | - | Nome/label |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| currency_id | INTEGER | NOT NULL | - | FK para currencies |
| is_primary | BOOLEAN | NOT NULL | FALSE | Se é carteira principal |
| is_active | BOOLEAN | NOT NULL | TRUE | Se está ativa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 10. `hardware` - Hardware/Equipamentos

```sql
CREATE TABLE hardware (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    model               VARCHAR(100) NOT NULL,
    manufacturer        VARCHAR(100) NOT NULL,
    hashrate            BIGINT NOT NULL,
    hashrate_unit       VARCHAR(10) DEFAULT 'TH/s',
    power_consumption   INTEGER NOT NULL,
    efficiency          DECIMAL(10, 2),
    organization_id     INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    serial_number       VARCHAR(100),
    purchase_date       DATE,
    warranty_until      DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,

    CONSTRAINT hardware_status_check CHECK (status IN ('ativo', 'inativo', 'manutencao'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(255) | NOT NULL | - | Nome do equipamento |
| model | VARCHAR(100) | NOT NULL | - | Modelo |
| manufacturer | VARCHAR(100) | NOT NULL | - | Fabricante |
| hashrate | BIGINT | NOT NULL | - | Hashrate nominal |
| hashrate_unit | VARCHAR(10) | NULL | TH/s | Unidade do hashrate |
| power_consumption | INTEGER | NOT NULL | - | Consumo em Watts |
| efficiency | DECIMAL(10,2) | NULL | - | J/TH |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| serial_number | VARCHAR(100) | NULL | - | Número de série |
| purchase_date | DATE | NULL | - | Data de compra |
| warranty_until | DATE | NULL | - | Garantia até |
| status | VARCHAR(20) | NOT NULL | ativo | Status |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 11. `workers` - Workers/Máquinas

```sql
CREATE TABLE workers (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    hardware_id         INTEGER REFERENCES hardware(id) ON DELETE SET NULL,
    organization_id     INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pool_id             INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    hashrate            BIGINT NOT NULL DEFAULT 0,
    hashrate_1h         BIGINT DEFAULT 0,
    hashrate_24h        BIGINT DEFAULT 0,
    shares_accepted     BIGINT NOT NULL DEFAULT 0,
    shares_rejected     BIGINT NOT NULL DEFAULT 0,
    shares_stale        BIGINT DEFAULT 0,
    difficulty          DECIMAL(20, 8) DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'offline',
    last_share_at       TIMESTAMPTZ,
    last_seen           TIMESTAMPTZ,
    ip_address          INET,
    user_agent          VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,

    CONSTRAINT workers_status_check CHECK (status IN ('online', 'offline', 'idle')),
    UNIQUE(pool_id, name)
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(255) | NOT NULL | - | Nome do worker |
| hardware_id | INTEGER | NULL | - | FK para hardware |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| pool_id | INTEGER | NOT NULL | - | FK para pools |
| hashrate | BIGINT | NOT NULL | 0 | Hashrate atual |
| hashrate_1h | BIGINT | NULL | 0 | Média 1 hora |
| hashrate_24h | BIGINT | NULL | 0 | Média 24 horas |
| shares_accepted | BIGINT | NOT NULL | 0 | Shares aceitas |
| shares_rejected | BIGINT | NOT NULL | 0 | Shares rejeitadas |
| shares_stale | BIGINT | NULL | 0 | Shares stale |
| difficulty | DECIMAL(20,8) | NULL | 0 | Dificuldade |
| status | VARCHAR(20) | NOT NULL | offline | Status |
| last_share_at | TIMESTAMPTZ | NULL | - | Última share |
| last_seen | TIMESTAMPTZ | NULL | - | Último heartbeat |
| ip_address | INET | NULL | - | IP do worker |
| user_agent | VARCHAR(255) | NULL | - | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 12. `payments` - Pagamentos

```sql
CREATE TABLE payments (
    id                  SERIAL PRIMARY KEY,
    organization_id     INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pool_id             INTEGER REFERENCES pools(id) ON DELETE SET NULL,
    wallet_id           INTEGER NOT NULL REFERENCES wallets(id),
    amount              DECIMAL(20, 8) NOT NULL,
    currency_id         INTEGER NOT NULL REFERENCES currencies(id),
    type                VARCHAR(30) NOT NULL DEFAULT 'block_reward',
    fee                 DECIMAL(20, 8) DEFAULT 0,
    tx_hash             VARCHAR(255),
    block_height        INTEGER,
    confirmations       INTEGER DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'pendente',
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,

    CONSTRAINT payments_status_check CHECK (status IN ('pendente', 'processando', 'concluido', 'falhou', 'cancelado')),
    CONSTRAINT payments_type_check CHECK (type IN ('block_reward', 'transaction_fee', 'withdrawal', 'manual', 'adjustment'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| pool_id | INTEGER | NULL | - | FK para pools (origem do pagamento) |
| wallet_id | INTEGER | NOT NULL | - | FK para wallets |
| amount | DECIMAL(20,8) | NOT NULL | - | Valor do pagamento |
| currency_id | INTEGER | NOT NULL | - | FK para currencies |
| type | VARCHAR(30) | NOT NULL | block_reward | Tipo: block_reward, transaction_fee, withdrawal, manual, adjustment |
| fee | DECIMAL(20,8) | NULL | 0 | Taxa de transação |
| tx_hash | VARCHAR(255) | NULL | - | Hash da transação |
| block_height | INTEGER | NULL | - | Altura do bloco |
| confirmations | INTEGER | NULL | 0 | Confirmações |
| status | VARCHAR(20) | NOT NULL | pendente | Status |
| notes | TEXT | NULL | - | Observações |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| processed_at | TIMESTAMPTZ | NULL | - | Data de processamento |
| confirmed_at | TIMESTAMPTZ | NULL | - | Data de confirmação |

---

### 13. `audit_logs` - Logs de Auditoria

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(20) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       TEXT,
    before_data     JSONB,
    after_data      JSONB,
    changes         JSONB,
    ip_address      INET,
    user_agent      TEXT,
    correlation_id  UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT audit_logs_action_check CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | BIGSERIAL | NOT NULL | auto | PK |
| organization_id | INTEGER | NULL | - | FK para organizations |
| user_id | UUID | NULL | - | FK para users |
| action | VARCHAR(20) | NOT NULL | - | Tipo de ação |
| entity_type | VARCHAR(50) | NULL | - | Tipo da entidade |
| entity_id | TEXT | NULL | - | ID da entidade (suporta INTEGER e UUID) |
| before_data | JSONB | NULL | - | Dados antes |
| after_data | JSONB | NULL | - | Dados depois |
| changes | JSONB | NULL | - | Alterações |
| ip_address | INET | NULL | - | IP do cliente |
| user_agent | TEXT | NULL | - | User agent |
| correlation_id | UUID | NOT NULL | gen_random_uuid() | ID de correlação |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 14. `endpoints` - Endpoints (Stratum/API)

```sql
CREATE TABLE endpoints (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    url             VARCHAR(500) NOT NULL,
    type            VARCHAR(20) NOT NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    port            INTEGER,
    difficulty      DECIMAL(20, 8),
    is_ssl          BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT endpoints_type_check CHECK (type IN ('stratum', 'api', 'webhook')),
    CONSTRAINT endpoints_status_check CHECK (status IN ('ativo', 'inativo'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(255) | NOT NULL | - | Nome do endpoint |
| url | VARCHAR(500) | NOT NULL | - | URL/Host |
| type | VARCHAR(20) | NOT NULL | - | stratum, api, webhook |
| organization_id | INTEGER | NULL | - | FK para organizations |
| port | INTEGER | NULL | - | Porta |
| difficulty | DECIMAL(20,8) | NULL | - | Dificuldade (stratum) |
| is_ssl | BOOLEAN | NULL | FALSE | Se usa SSL |
| status | VARCHAR(20) | NOT NULL | ativo | Status |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |

---

### 15. `rounds` - Rounds de Mineração

```sql
CREATE TABLE rounds (
    id                  SERIAL PRIMARY KEY,
    pool_id             INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    height              INTEGER NOT NULL,
    hash                VARCHAR(64) NOT NULL UNIQUE,
    reward              DECIMAL(20, 8) NOT NULL,
    transaction_fees    DECIMAL(20, 8) DEFAULT 0,
    total_shares        BIGINT NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'pendente',
    found_by            VARCHAR(255),
    found_at            TIMESTAMPTZ NOT NULL,
    confirmed_at        TIMESTAMPTZ,
    mature_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT rounds_status_check CHECK (status IN ('pendente', 'confirmado', 'orfao', 'maturo'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| pool_id | INTEGER | NOT NULL | - | FK para pools |
| height | INTEGER | NOT NULL | - | Altura do bloco |
| hash | VARCHAR(64) | NOT NULL | - | Hash do bloco |
| reward | DECIMAL(20,8) | NOT NULL | - | Recompensa do bloco (subsídio) |
| transaction_fees | DECIMAL(20,8) | NULL | 0 | Taxas das transações incluídas |
| total_shares | BIGINT | NOT NULL | 0 | Total de shares |
| status | VARCHAR(20) | NOT NULL | pendente | Status |
| found_by | VARCHAR(255) | NULL | - | Worker que encontrou |
| found_at | TIMESTAMPTZ | NOT NULL | - | Data/hora encontrado |
| confirmed_at | TIMESTAMPTZ | NULL | - | Data de confirmação |
| mature_at | TIMESTAMPTZ | NULL | - | Data de maturidade |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 16. `webhooks` - Webhooks

```sql
CREATE TABLE webhooks (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    url             VARCHAR(500) NOT NULL,
    events          TEXT[] NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    secret          VARCHAR(255),
    headers         JSONB,
    retry_count     INTEGER DEFAULT 3,
    timeout_ms      INTEGER DEFAULT 30000,
    status          VARCHAR(20) NOT NULL DEFAULT 'ativo',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    last_triggered  TIMESTAMPTZ,

    CONSTRAINT webhooks_status_check CHECK (status IN ('ativo', 'inativo'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| name | VARCHAR(255) | NOT NULL | - | Nome do webhook |
| url | VARCHAR(500) | NOT NULL | - | URL de destino |
| events | TEXT[] | NOT NULL | - | Eventos assinados |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| secret | VARCHAR(255) | NULL | - | Secret para assinatura |
| headers | JSONB | NULL | - | Headers customizados |
| retry_count | INTEGER | NULL | 3 | Tentativas de retry |
| timeout_ms | INTEGER | NULL | 30000 | Timeout em ms |
| status | VARCHAR(20) | NOT NULL | ativo | Status |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NULL | - | Data de atualização |
| last_triggered | TIMESTAMPTZ | NULL | - | Último disparo |

---

### 17. `webhook_deliveries` - Entregas de Webhooks

```sql
CREATE TABLE webhook_deliveries (
    id              BIGSERIAL PRIMARY KEY,
    webhook_id      INTEGER NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event           VARCHAR(50) NOT NULL,
    payload         JSONB NOT NULL,
    response_code   INTEGER,
    response_body   TEXT,
    duration_ms     INTEGER,
    attempt         INTEGER NOT NULL DEFAULT 1,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at    TIMESTAMPTZ,

    CONSTRAINT webhook_deliveries_status_check CHECK (status IN ('pending', 'success', 'failed'))
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | BIGSERIAL | NOT NULL | auto | PK |
| webhook_id | INTEGER | NOT NULL | - | FK para webhooks |
| event | VARCHAR(50) | NOT NULL | - | Nome do evento |
| payload | JSONB | NOT NULL | - | Payload enviado |
| response_code | INTEGER | NULL | - | Código HTTP resposta |
| response_body | TEXT | NULL | - | Body da resposta |
| duration_ms | INTEGER | NULL | - | Duração em ms |
| attempt | INTEGER | NOT NULL | 1 | Número da tentativa |
| status | VARCHAR(20) | NOT NULL | pending | Status |
| error_message | TEXT | NULL | - | Mensagem de erro |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |
| delivered_at | TIMESTAMPTZ | NULL | - | Data de entrega |

---

### 18. `pool_stats` - Estatísticas dos Pools

```sql
CREATE TABLE pool_stats (
    id                      BIGSERIAL PRIMARY KEY,
    pool_id                 INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    source                  VARCHAR(100) NOT NULL,
    collected_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Informações gerais
    runtime_seconds         BIGINT,
    last_update             TIMESTAMPTZ,

    -- Usuários e Workers
    users                   INTEGER DEFAULT 0,
    workers_total           INTEGER DEFAULT 0,
    workers_active          INTEGER DEFAULT 0,
    workers_idle            INTEGER DEFAULT 0,
    workers_disconnected    INTEGER DEFAULT 0,

    -- Hashrates (em H/s - converter de PH/s, TH/s no app)
    hashrate_1m             BIGINT DEFAULT 0,
    hashrate_5m             BIGINT DEFAULT 0,
    hashrate_15m            BIGINT DEFAULT 0,
    hashrate_1h             BIGINT DEFAULT 0,
    hashrate_6h             BIGINT DEFAULT 0,
    hashrate_1d             BIGINT DEFAULT 0,
    hashrate_7d             BIGINT DEFAULT 0,

    -- Shares
    shares_accepted         BIGINT DEFAULT 0,
    shares_rejected         BIGINT DEFAULT 0,
    best_share              BIGINT DEFAULT 0,

    -- Shares por segundo
    shares_per_second_1m    BIGINT DEFAULT 0,
    shares_per_second_5m    BIGINT DEFAULT 0,
    shares_per_second_15m   BIGINT DEFAULT 0,
    shares_per_second_1h    BIGINT DEFAULT 0,

    -- Dificuldade
    difficulty              DECIMAL(30, 8) DEFAULT 0,
    network_diff_percent    DECIMAL(10, 4) DEFAULT 0,

    -- Dados brutos da API
    raw_data                JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | BIGSERIAL | NOT NULL | auto | PK |
| pool_id | INTEGER | NOT NULL | - | FK para pools |
| source | VARCHAR(100) | NOT NULL | - | Identificador da fonte (ex: "ckpool", "slushpool", "f2pool") |
| collected_at | TIMESTAMPTZ | NOT NULL | NOW() | Data/hora da coleta |
| runtime_seconds | BIGINT | NULL | - | Uptime do pool em segundos |
| last_update | TIMESTAMPTZ | NULL | - | Última atualização da API fonte |
| users | INTEGER | NULL | 0 | Total de usuários no pool |
| workers_total | INTEGER | NULL | 0 | Total de workers |
| workers_active | INTEGER | NULL | 0 | Workers ativos minerando |
| workers_idle | INTEGER | NULL | 0 | Workers inativos/idle |
| workers_disconnected | INTEGER | NULL | 0 | Workers desconectados |
| hashrate_1m | BIGINT | NULL | 0 | Hashrate médio 1 minuto (H/s) |
| hashrate_5m | BIGINT | NULL | 0 | Hashrate médio 5 minutos (H/s) |
| hashrate_15m | BIGINT | NULL | 0 | Hashrate médio 15 minutos (H/s) |
| hashrate_1h | BIGINT | NULL | 0 | Hashrate médio 1 hora (H/s) |
| hashrate_6h | BIGINT | NULL | 0 | Hashrate médio 6 horas (H/s) |
| hashrate_1d | BIGINT | NULL | 0 | Hashrate médio 1 dia (H/s) |
| hashrate_7d | BIGINT | NULL | 0 | Hashrate médio 7 dias (H/s) |
| shares_accepted | BIGINT | NULL | 0 | Total de shares aceitas |
| shares_rejected | BIGINT | NULL | 0 | Total de shares rejeitadas |
| best_share | BIGINT | NULL | 0 | Melhor dificuldade de share alcançada |
| shares_per_second_1m | BIGINT | NULL | 0 | Shares por segundo (média 1 min) |
| shares_per_second_5m | BIGINT | NULL | 0 | Shares por segundo (média 5 min) |
| shares_per_second_15m | BIGINT | NULL | 0 | Shares por segundo (média 15 min) |
| shares_per_second_1h | BIGINT | NULL | 0 | Shares por segundo (média 1 hora) |
| difficulty | DECIMAL(30,8) | NULL | 0 | Dificuldade da rede |
| network_diff_percent | DECIMAL(10,4) | NULL | 0 | Percentual da dificuldade da rede (%) |
| raw_data | JSONB | NULL | - | Dados brutos da API para referência |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação do registro |

---

### 19. `revenue_reports` - Relatórios de Revenue

```sql
CREATE TABLE revenue_reports (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pool_id         INTEGER REFERENCES pools(id) ON DELETE SET NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    total_hashrate  BIGINT DEFAULT 0,
    total_shares    BIGINT DEFAULT 0,
    blocks_found    INTEGER DEFAULT 0,
    gross_revenue   DECIMAL(20, 8) DEFAULT 0,
    pool_fees       DECIMAL(20, 8) DEFAULT 0,
    net_revenue     DECIMAL(20, 8) DEFAULT 0,
    energy_cost     DECIMAL(20, 8) DEFAULT 0,
    profit          DECIMAL(20, 8) DEFAULT 0,
    currency_id     INTEGER REFERENCES currencies(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, pool_id, period_start, period_end)
);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| organization_id | INTEGER | NOT NULL | - | FK para organizations |
| pool_id | INTEGER | NULL | - | FK para pools |
| period_start | DATE | NOT NULL | - | Início do período |
| period_end | DATE | NOT NULL | - | Fim do período |
| total_hashrate | BIGINT | NULL | 0 | Hashrate médio |
| total_shares | BIGINT | NULL | 0 | Total de shares |
| blocks_found | INTEGER | NULL | 0 | Blocos encontrados |
| gross_revenue | DECIMAL(20,8) | NULL | 0 | Receita bruta |
| pool_fees | DECIMAL(20,8) | NULL | 0 | Taxas do pool |
| net_revenue | DECIMAL(20,8) | NULL | 0 | Receita líquida |
| energy_cost | DECIMAL(20,8) | NULL | 0 | Custo de energia |
| profit | DECIMAL(20,8) | NULL | 0 | Lucro final |
| currency_id | INTEGER | NULL | - | FK para currencies |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

### 20. `worker_stats_history` - Histórico de Estatísticas dos Workers

```sql
CREATE TABLE worker_stats_history (
    id              BIGSERIAL PRIMARY KEY,
    worker_id       INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    hashrate        BIGINT NOT NULL DEFAULT 0,
    shares_accepted BIGINT NOT NULL DEFAULT 0,
    shares_rejected BIGINT NOT NULL DEFAULT 0,
    temperature     DECIMAL(5, 2),
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas de séries temporais
CREATE INDEX idx_worker_stats_history_worker_id ON worker_stats_history(worker_id);
CREATE INDEX idx_worker_stats_history_collected_at ON worker_stats_history(collected_at);
CREATE INDEX idx_worker_stats_history_worker_collected ON worker_stats_history(worker_id, collected_at DESC);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | BIGSERIAL | NOT NULL | auto | PK |
| worker_id | INTEGER | NOT NULL | - | FK para workers |
| hashrate | BIGINT | NOT NULL | 0 | Hashrate no momento |
| shares_accepted | BIGINT | NOT NULL | 0 | Shares aceitas acumuladas |
| shares_rejected | BIGINT | NOT NULL | 0 | Shares rejeitadas acumuladas |
| temperature | DECIMAL(5,2) | NULL | - | Temperatura do equipamento |
| collected_at | TIMESTAMPTZ | NOT NULL | NOW() | Data/hora da coleta |

---

### 21. `payment_rounds` - Relação Pagamento-Round (N:N)

```sql
CREATE TABLE payment_rounds (
    id              SERIAL PRIMARY KEY,
    payment_id      INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    round_id        INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    amount          DECIMAL(20, 8) NOT NULL,
    share_percent   DECIMAL(10, 6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(payment_id, round_id)
);

-- Índices
CREATE INDEX idx_payment_rounds_payment_id ON payment_rounds(payment_id);
CREATE INDEX idx_payment_rounds_round_id ON payment_rounds(round_id);
```

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | SERIAL | NOT NULL | auto | PK |
| payment_id | INTEGER | NOT NULL | - | FK para payments |
| round_id | INTEGER | NOT NULL | - | FK para rounds |
| amount | DECIMAL(20,8) | NOT NULL | - | Valor do pagamento referente a este round |
| share_percent | DECIMAL(10,6) | NULL | - | Porcentagem de participação no round |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Data de criação |

---

## Índices Recomendados

```sql
-- Organizations
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_cnpj ON organizations(cnpj) WHERE cnpj IS NOT NULL;

-- Users
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Pools
CREATE INDEX idx_pools_organization_id ON pools(organization_id);
CREATE INDEX idx_pools_currency_id ON pools(currency_id);
CREATE INDEX idx_pools_is_active ON pools(is_active);

-- Wallets
CREATE INDEX idx_wallets_organization_id ON wallets(organization_id);
CREATE INDEX idx_wallets_currency_id ON wallets(currency_id);
CREATE INDEX idx_wallets_address ON wallets(address);

-- Hardware
CREATE INDEX idx_hardware_organization_id ON hardware(organization_id);
CREATE INDEX idx_hardware_status ON hardware(status);

-- Workers
CREATE INDEX idx_workers_organization_id ON workers(organization_id);
CREATE INDEX idx_workers_pool_id ON workers(pool_id);
CREATE INDEX idx_workers_hardware_id ON workers(hardware_id);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_last_seen ON workers(last_seen);

-- Payments
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_pool_id ON payments(pool_id);
CREATE INDEX idx_payments_wallet_id ON payments(wallet_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash) WHERE tx_hash IS NOT NULL;

-- Audit Logs
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id);

-- Endpoints
CREATE INDEX idx_endpoints_organization_id ON endpoints(organization_id);
CREATE INDEX idx_endpoints_type ON endpoints(type);
CREATE INDEX idx_endpoints_status ON endpoints(status);

-- Rounds
CREATE INDEX idx_rounds_pool_id ON rounds(pool_id);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_rounds_height ON rounds(height);
CREATE INDEX idx_rounds_found_at ON rounds(found_at);

-- Webhooks
CREATE INDEX idx_webhooks_organization_id ON webhooks(organization_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);

-- Webhook Deliveries
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);

-- Pool Stats
CREATE INDEX idx_pool_stats_pool_id ON pool_stats(pool_id);
CREATE INDEX idx_pool_stats_source ON pool_stats(source);
CREATE INDEX idx_pool_stats_collected_at ON pool_stats(collected_at DESC);
CREATE INDEX idx_pool_stats_created_at ON pool_stats(created_at DESC);
CREATE INDEX idx_pool_stats_pool_collected ON pool_stats(pool_id, collected_at DESC);
CREATE INDEX idx_pool_stats_pool_source ON pool_stats(pool_id, source);
CREATE INDEX idx_pool_stats_pool_source_collected ON pool_stats(pool_id, source, collected_at DESC);

-- Revenue Reports
CREATE INDEX idx_revenue_reports_organization_id ON revenue_reports(organization_id);
CREATE INDEX idx_revenue_reports_period ON revenue_reports(period_start, period_end);
```

---

## Políticas RLS

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter organization_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM users
        WHERE auth_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se é super_admin (level = 100)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.auth_user_id = auth.uid()
        AND r.level = 100
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para obter o nível do usuário atual
CREATE OR REPLACE FUNCTION get_user_level()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT r.level
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.auth_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo: Policy para organizations
CREATE POLICY "Super admins can do everything on organizations"
ON organizations FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Org admins can view their organization"
ON organizations FOR SELECT
TO authenticated
USING (id = get_user_organization_id());

-- Exemplo: Policy para users
CREATE POLICY "Super admins can do everything on users"
ON users FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Users can view users from same organization"
ON users FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());
```

---

## Triggers e Functions

### Trigger para updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pools_updated_at
    BEFORE UPDATE ON pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_updated_at
    BEFORE UPDATE ON hardware
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at
    BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_endpoints_updated_at
    BEFORE UPDATE ON endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Trigger para Auditoria Automática

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_org_id INTEGER;
BEGIN
    -- Obter usuário atual
    SELECT id, organization_id INTO current_user_id, current_org_id
    FROM users WHERE auth_user_id = auth.uid();

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, after_data)
        VALUES (current_org_id, current_user_id, 'CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, before_data, after_data, changes)
        VALUES (
            current_org_id,
            current_user_id,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_diff(to_jsonb(OLD), to_jsonb(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, before_data)
        VALUES (current_org_id, current_user_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para calcular diferenças em JSONB
CREATE OR REPLACE FUNCTION jsonb_diff(old_data JSONB, new_data JSONB)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    key TEXT;
BEGIN
    FOR key IN SELECT jsonb_object_keys(new_data)
    LOOP
        IF old_data->key IS DISTINCT FROM new_data->key THEN
            result := result || jsonb_build_object(key, jsonb_build_object('old', old_data->key, 'new', new_data->key));
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de auditoria (exemplo)
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Trigger para criar usuário após auth.users

```sql
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id INTEGER;
BEGIN
    -- Buscar role padrão para novos usuários (Org Miner, level = 10)
    SELECT id INTO default_role_id
    FROM roles
    WHERE level = 10
    LIMIT 1;

    -- Se não encontrar role, usar a de menor nível disponível
    IF default_role_id IS NULL THEN
        SELECT id INTO default_role_id FROM roles ORDER BY level ASC LIMIT 1;
    END IF;

    INSERT INTO public.users (auth_user_id, email, name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        default_role_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
```

---

## Views Úteis

### View de Usuários com Detalhes

```sql
CREATE OR REPLACE VIEW v_users_details AS
SELECT
    u.id,
    u.auth_user_id,
    u.email,
    u.name,
    u.phone,
    u.avatar_url,
    u.status,
    u.created_at,
    u.updated_at,
    o.id AS organization_id,
    o.name AS organization_name,
    r.id AS role_id,
    r.name AS role_name,
    r.level AS role_level,
    r.badge_color AS role_badge_color
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
JOIN roles r ON u.role_id = r.id;
```

### View de Workers com Detalhes

```sql
CREATE OR REPLACE VIEW v_workers_details AS
SELECT
    w.id,
    w.name,
    w.hashrate,
    w.hashrate_1h,
    w.hashrate_24h,
    w.shares_accepted,
    w.shares_rejected,
    w.status,
    w.last_seen,
    w.created_at,
    o.id AS organization_id,
    o.name AS organization_name,
    p.id AS pool_id,
    p.name AS pool_name,
    h.id AS hardware_id,
    h.name AS hardware_name,
    h.model AS hardware_model
FROM workers w
JOIN organizations o ON w.organization_id = o.id
JOIN pools p ON w.pool_id = p.id
LEFT JOIN hardware h ON w.hardware_id = h.id;
```

### View de Pagamentos com Detalhes

```sql
CREATE OR REPLACE VIEW v_payments_details AS
SELECT
    p.id,
    p.amount,
    p.fee,
    p.tx_hash,
    p.status,
    p.created_at,
    p.processed_at,
    o.id AS organization_id,
    o.name AS organization_name,
    w.id AS wallet_id,
    w.address AS wallet_address,
    w.label AS wallet_label,
    c.id AS currency_id,
    c.symbol AS currency_symbol,
    c.name AS currency_name
FROM payments p
JOIN organizations o ON p.organization_id = o.id
JOIN wallets w ON p.wallet_id = w.id
JOIN currencies c ON p.currency_id = c.id;
```

### View de Dashboard Stats

```sql
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM organizations WHERE status = 'ativo') AS total_organizations,
    (SELECT COUNT(*) FROM users WHERE status = 'ativo') AS total_users,
    (SELECT COUNT(*) FROM workers WHERE status = 'online') AS active_workers,
    (SELECT COUNT(*) FROM workers) AS total_workers,
    (SELECT COALESCE(SUM(hashrate), 0) FROM workers WHERE status = 'online') AS total_hashrate,
    (SELECT COUNT(*) FROM pools WHERE is_active = true) AS active_pools,
    (SELECT COUNT(*) FROM payments WHERE status = 'pendente') AS pending_payments,
    (SELECT COUNT(*) FROM rounds WHERE status = 'pendente') AS pending_rounds;
```

---

## Resumo das Tabelas

| # | Tabela | Registros Esperados | Crítica |
|---|--------|---------------------|---------|
| 1 | permissions | ~20-50 | Sim |
| 2 | roles | ~10-20 | Sim |
| 3 | role_permissions | ~50-200 | Sim |
| 4 | organizations | ~10-100 | Sim |
| 5 | users | ~100-1000 | Sim |
| 6 | currencies | ~5-20 | Sim |
| 7 | payout_models | ~3 | Sim |
| 8 | pools | ~10-50 | Sim |
| 9 | wallets | ~50-500 | Sim |
| 10 | hardware | ~100-1000 | Média |
| 11 | workers | ~1000-10000 | Alta |
| 12 | payments | ~10000+ | Alta |
| 13 | audit_logs | ~100000+ | Alta |
| 14 | endpoints | ~10-50 | Baixa |
| 15 | rounds | ~10000+ | Alta |
| 16 | webhooks | ~10-100 | Baixa |
| 17 | webhook_deliveries | ~10000+ | Média |
| 18 | pool_stats | ~100000+ | Alta |
| 19 | revenue_reports | ~1000-5000 | Média |
| 20 | worker_stats_history | ~1000000+ | Alta |
| 21 | payment_rounds | ~50000+ | Média |

---

## Considerações Finais

1. **Particionamento**: Considere particionar tabelas de alto volume (audit_logs, pool_stats, webhook_deliveries, worker_stats_history) por data.

2. **Arquivamento**: Implemente políticas de arquivamento para dados antigos em tabelas de logs e históricos.

3. **Backup**: Configure backups automáticos com Point-in-Time Recovery (PITR) do Supabase.

4. **Monitoramento**: Use pg_stat_statements e Supabase Dashboard para monitorar queries lentas.

5. **Extensões úteis**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

---

*Documento gerado em: 2025-12-17*
*Projeto: Est3lar Pool v2*
