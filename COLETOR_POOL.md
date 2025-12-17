# Sistema de Coleta de Estatisticas - Genesis Pool

**Status:** FUNCIONANDO
**Data Implementacao:** 17/12/2025
**Frequencia:** A cada 1 minuto (cronjob)

---

## Resumo

Sistema automatizado que coleta estatisticas da Genesis Pool (Hydrapool) na VM 140 e envia para o banco de dados Supabase atraves de uma Edge Function.

---

## Arquitetura

```
VM 140 (cronjob a cada minuto)
    |
    +-- Le: /home/ubuntu/genesispool/stats/pool/pool_stats.json
    +-- Le: bitcoin-cli getblockchaininfo
    |
    +-- POST --> Edge Function (pool-stats-collector)
                    |
                    +-- INSERT --> tabela pool_stats (Supabase)
```

---

## Acesso

### 1. Proxmox (Host)

| Item | Valor |
|------|-------|
| IP | 45.6.217.122 |
| Porta Web UI | 8006 |
| URL | https://45.6.217.122:8006 |
| Usuario | root |
| Senha | Rapadura |

```bash
# SSH direto ao Proxmox
sshpass -p 'Rapadura' ssh -o StrictHostKeyChecking=no root@45.6.217.122
```

### 2. VM 140 (vm-genesis-pool)

| Item | Valor |
|------|-------|
| IP Interno | 10.20.30.15 |
| Usuario | ubuntu |
| Senha | Rapadura |

```bash
# SSH via jump host (do seu computador)
sshpass -p 'Rapadura' ssh -o StrictHostKeyChecking=no -J root@45.6.217.122 ubuntu@10.20.30.15

# SSH direto do Proxmox
sshpass -p 'Rapadura' ssh -o StrictHostKeyChecking=no ubuntu@10.20.30.15
```

### 3. Diretorio do Coletor

```
/home/ubuntu/collector/
├── pool_collector.sh   # Script principal de coleta
├── collector.log       # Log das execucoes
└── cron.log           # Log do cron (stderr)
```

---

## Componentes

### 1. Script Coletor (VM 140)

**Caminho:** `/home/ubuntu/collector/pool_collector.sh`

**Funcao:** Coleta dados da pool e do Bitcoin Core, monta payload JSON e envia para a Edge Function.

**Dados Coletados:**
- Pool: users, workers (total/active/idle), shares (accepted/rejected), best_share
- Bitcoin: network difficulty
- Calculados: runtime_seconds, hashrate estimado, shares/segundo
- Raw: JSON completo do pool_stats.json

### 2. Cronjob

**Configuracao:** Executa a cada minuto

```bash
# Ver crontab atual
crontab -l

# Saida esperada:
* * * * * /home/ubuntu/collector/pool_collector.sh >> /home/ubuntu/collector/cron.log 2>&1
```

### 3. Edge Function (Supabase)

| Item | Valor |
|------|-------|
| Nome | pool-stats-collector |
| URL | https://tcgrxhrmzmsasnpekhaq.supabase.co/functions/v1/pool-stats-collector |
| Metodo | POST |
| Autenticacao | Header `x-pool-secret` + JWT |

### 4. Tabela no Banco (Supabase)

**Tabela:** `pool_stats`

**Pool cadastrada:**
| ID | Nome | Organizacao |
|----|------|-------------|
| 1 | Genesis Pool | Est3lar Mining Corp |

---

## Configuracoes

### Variaveis do Script

```bash
POOL_ID=1
SOURCE="hydrapool"
POOL_STATS_FILE="/home/ubuntu/genesispool/stats/pool/pool_stats.json"
SUPABASE_URL="https://tcgrxhrmzmsasnpekhaq.supabase.co/functions/v1/pool-stats-collector"
COLLECTOR_SECRET="genesis-pool-collector-2025"
LOG_FILE="/home/ubuntu/collector/collector.log"
```

### Supabase

| Item | Valor |
|------|-------|
| Projeto | tcgrxhrmzmsasnpekhaq |
| URL | https://tcgrxhrmzmsasnpekhaq.supabase.co |
| Anon Key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |

---

## Comandos Uteis

### Verificar Status

```bash
# Ver logs do coletor
tail -f /home/ubuntu/collector/collector.log

# Ver ultimas execucoes
tail -20 /home/ubuntu/collector/collector.log

# Verificar crontab
crontab -l
```

### Executar Manualmente

```bash
# Executar coleta manual
/home/ubuntu/collector/pool_collector.sh

# Ver resultado
cat /home/ubuntu/collector/collector.log
```

### Gerenciar Cronjob

```bash
# Editar crontab
crontab -e

# Remover cronjob do coletor
crontab -l | grep -v pool_collector | crontab -

# Adicionar cronjob novamente
(crontab -l 2>/dev/null; echo "* * * * * /home/ubuntu/collector/pool_collector.sh >> /home/ubuntu/collector/cron.log 2>&1") | crontab -
```

### Verificar Dados no Supabase

```sql
-- Ultimos registros coletados
SELECT id, collected_at, users, workers_total, workers_active, shares_accepted, best_share
FROM pool_stats
ORDER BY collected_at DESC
LIMIT 10;

-- Contagem total de registros
SELECT COUNT(*) FROM pool_stats WHERE pool_id = 1;
```

---

## Dados Coletados

Cada execucao insere um registro com:

| Campo | Descricao | Fonte |
|-------|-----------|-------|
| pool_id | ID da pool (1) | Fixo |
| source | Identificador da fonte (hydrapool) | Fixo |
| collected_at | Timestamp da coleta | Automatico |
| runtime_seconds | Tempo de execucao da pool | Calculado |
| users | Quantidade de usuarios | pool_stats.json |
| workers_total | Total de workers | pool_stats.json |
| workers_active | Workers ativos | pool_stats.json |
| workers_idle | Workers ociosos | Calculado |
| shares_accepted | Total de shares aceitas | pool_stats.json |
| shares_rejected | Total de shares rejeitadas | pool_stats.json |
| best_share | Melhor share encontrada | pool_stats.json |
| difficulty | Dificuldade da rede Bitcoin | bitcoin-cli |
| hashrate_* | Hashrate estimado | Calculado |
| shares_per_second_* | Shares por segundo | Calculado |
| raw_data | JSON completo original | pool_stats.json |

---

## Troubleshooting

### Coleta nao esta funcionando

1. Verificar se o cronjob esta ativo:
```bash
crontab -l | grep pool_collector
```

2. Verificar logs de erro:
```bash
cat /home/ubuntu/collector/collector.log
cat /home/ubuntu/collector/cron.log
```

3. Testar execucao manual:
```bash
/home/ubuntu/collector/pool_collector.sh
```

### Erro de autenticacao (401)

Verificar se os headers estao corretos no script:
- `Authorization: Bearer <ANON_KEY>`
- `apikey: <ANON_KEY>`
- `x-pool-secret: genesis-pool-collector-2025`

### Arquivo pool_stats.json nao encontrado

Verificar se a pool esta rodando:
```bash
ps aux | grep hydrapool
ls -la /home/ubuntu/genesispool/stats/pool/
```

---

## Historico

| Data | Acao |
|------|------|
| 17/12/2025 | Implementacao inicial do sistema de coleta |
| 17/12/2025 | Criacao da Edge Function pool-stats-collector |
| 17/12/2025 | Cadastro da Genesis Pool no banco (id=1) |
| 17/12/2025 | Configuracao do cronjob para execucao a cada minuto |

---

**Responsavel:** Wilson - Genesis Tech
**Implementado por:** Wilson - Genesis Tech
