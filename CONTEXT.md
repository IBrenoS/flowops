# FlowOps — CONTEXT.md
> **Fonte de verdade do projeto.** Leia este arquivo INTEGRALMENTE antes de qualquer tarefa.
> Última atualização: 2026-02-21

---

## 1. O Produto

**FlowOps** é um SaaS de automação operacional para distribuidoras e atacadistas brasileiras.

**Proposta de valor:** O pedido chega no WhatsApp. O ERP já sabe.

**Fluxo principal (MVP):**
1. Cliente envia pedido por texto ou áudio no WhatsApp da distribuidora
2. Evolution API (gerenciada pelo FlowOps) dispara webhook para `POST /webhook/whatsapp`
3. BullMQ enfileira o job `process-order` (desacopla recebimento de processamento)
4. Worker transcreve áudio se necessário (OpenAI Whisper)
5. OpenAI GPT-4o mini com function calling extrai produtos, quantidades, cliente e condição de pagamento
6. Confiança ≥ 70% → cria pedido no ERP (Bling/Omie/Tiny) automaticamente
7. Confiança < 70% → status `REVIEW`, notifica gestor no dashboard
8. Confirmação enviada ao cliente via WhatsApp
9. Evento registrado no dashboard com timeline completa

**Tempo médio end-to-end:** 6 segundos

---

## 2. Decisões de Arquitetura

### WhatsApp — 100% Gerenciado pelo FlowOps
- FlowOps opera toda a infraestrutura Evolution API internamente
- Usuário conecta via **QR code apenas** (como WhatsApp Web)
- `instanceId` é gerado automaticamente como ID interno (ex: `flowops-a8f3c2`)
- **NUNCA expor** URL, API key ou nome de instância ao usuário final
- Onboarding: QR code → scan → conectado. Zero configuração técnica

### ERP — Adapter Pattern
- Interface `IERPAdapter` em `packages/erp/src/index.ts` é o contrato central
- Todos os adaptadores implementam a mesma interface
- Adicionar novo ERP = implementar `IERPAdapter` sem tocar no core
- ERPs suportados no MVP: Bling v3, Omie, Tiny ERP

### IA — Function Calling estruturado
- Nunca usar text completion livre para extrair dados de pedidos
- Sempre usar OpenAI function calling com schema Zod tipado
- Output é `ExtractedOrder` — tipado, validado, nunca string livre
- Threshold de confiança: `HIGH ≥ 0.85`, `MEDIUM ≥ 0.70`, `LOW < 0.70`

### Filas — BullMQ resiliente
- Todo webhook é enfileirado imediatamente — nunca processado de forma síncrona
- `process-order`: 3 tentativas, backoff exponencial (2s, 4s, 8s)
- `send-whatsapp`: 5 tentativas (crítico — confirmação ao cliente)
- Webhooks do Evolution API não fazem retry → BullMQ garante resiliência

---

## 3. Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | Node.js | 20 LTS |
| Linguagem | TypeScript | 5.x strict |
| Backend | Fastify | 4.x |
| Filas | BullMQ + Redis | 5.x |
| ORM | Prisma | 5.x |
| Frontend | Next.js App Router | 14.x |
| Estado cliente | TanStack Query | 5.x |
| IA | OpenAI SDK | 4.x |
| WhatsApp | Evolution API | gerenciada |
| Monorepo | pnpm workspaces + Turborepo | pnpm 9 |
| Infra | Railway | — |

---

## 4. Estrutura do Monorepo

```
flowops/
├── apps/
│   ├── api/          # Backend Fastify — rotas, webhooks, workers
│   └── web/          # Frontend Next.js — dashboard e configurações
└── packages/
    ├── shared/       # Tipos, constantes e utils compartilhados (sem deps externas)
    ├── database/     # Prisma schema + PrismaClient singleton
    ├── ai/           # OpenAI SDK — extraction engine, Whisper
    ├── erp/          # IERPAdapter + adaptadores Bling, Omie, Tiny
    └── whatsapp/     # Evolution API client
```

**Regra de dependência:** packages não podem depender de apps. `shared` não depende de nada externo.

---

## 5. Database — Models Prisma

### Tenant
```
id, name, email, passwordHash, plan (STARTER|GROWTH|PRO), isActive, createdAt, updatedAt
```

### User
```
id, tenantId, name, email, role (ADMIN|MEMBER), isActive, createdAt
```

### WhatsappInstance
```
id, tenantId (unique), instanceId (unique — interno), status (CONNECTED|DISCONNECTED|CONNECTING),
phone (nullable), connectedAt (nullable), createdAt
```

### ERPConnection
```
id, tenantId, type (BLING|OMIE|TINY), config (Json — tokens criptografados), isActive
unique: [tenantId, type]
```

### Flow
```
id, tenantId, name, description, status (ACTIVE|PAUSED|DRAFT),
steps (Json — FlowStep[]), runCount, successRate, createdAt, updatedAt
```

### Order
```
id, tenantId, flowId (nullable), fromPhone, rawMessage, messageId (unique — idempotência),
extractedData (Json nullable), confidence (Float), confidenceLevel (String),
erpType, erpOrderId, erpOrderRef, erpOrderUrl,
status (PENDING|PROCESSING|COMPLETED|REVIEW|FAILED), processingMs, errorMessage,
createdAt, updatedAt
```

### OrderEvent
```
id, orderId, step (String — ORDER_STEPS constant), status ('success'|'error'),
data (Json nullable), durationMs, createdAt
```

---

## 6. Rotas da API (apps/api)

### Auth
```
POST /auth/register     → cria tenant + user admin
POST /auth/login        → retorna JWT
POST /auth/refresh      → renova token
```

### Webhook (sem autenticação — validado por secret no header)
```
POST /webhook/whatsapp  → recebe evento Evolution API, enfileira job
```

### WhatsApp
```
POST /whatsapp/connect      → gera QR code para o tenant
GET  /whatsapp/status       → status da instância
POST /whatsapp/disconnect   → desconecta instância
```

### ERP
```
POST /erp/connect           → salva credenciais criptografadas
POST /erp/test/:type        → testa conexão com o ERP
DELETE /erp/:type           → remove conexão
```

### Orders
```
GET  /orders               → lista paginada com filtros
GET  /orders/:id           → detalhe + events timeline
POST /orders/:id/approve   → aprova pedido em REVIEW
POST /orders/:id/reject    → rejeita pedido em REVIEW
```

### Flows
```
GET    /flows              → lista fluxos do tenant
POST   /flows              → cria novo fluxo
PATCH  /flows/:id          → atualiza fluxo
DELETE /flows/:id          → remove fluxo
POST   /flows/:id/toggle   → ativa/pausa fluxo
```

### Metrics
```
GET /metrics               → KPIs do dashboard (período configurável)
GET /metrics/orders        → série temporal de pedidos
```

---

## 7. Tipos Core (packages/shared)

```typescript
// Tipos principais — ver packages/shared/src/types/index.ts
ExtractedOrder      // resultado da extração por IA
ExtractedItem       // item de pedido extraído
WebhookPayload      // payload normalizado do Evolution API
IERPAdapter         // contrato de todos os adaptadores ERP
ERPOrder            // pedido enviado ao ERP
ERPOrderResult      // resposta do ERP após criação
ProcessOrderJobData // dados do job BullMQ principal
```

---

## 8. Variáveis de Ambiente

Ver `.env.example` na raiz para lista completa e comentada.

**Obrigatórias para rodar:**
- `DATABASE_URL` — PostgreSQL
- `REDIS_URL` — Redis (BullMQ)
- `OPENAI_API_KEY` — OpenAI
- `EVOLUTION_API_URL` + `EVOLUTION_API_KEY` — WhatsApp
- `JWT_SECRET` — autenticação
- `ENCRYPTION_KEY` — criptografia de tokens ERP no banco

---

## 9. Convenções de Código

- **TypeScript strict** — zero `any`, zero `as unknown`
- **Erros explícitos** — sempre trate erros em workers e rotas com try/catch tipado
- **Sem segredos hardcoded** — toda configuração via variável de ambiente
- **Idempotência** — Order usa `messageId` único para evitar processamento duplicado
- **Logs estruturados** — use o logger do Fastify, nunca `console.log` em produção
- **Nomes em inglês** — código em inglês, comentários podem ser português
- **Barrel exports** — cada package tem `src/index.ts` que re-exporta tudo
- **Zod para validação** — todos os inputs externos (webhook, API) validados com Zod antes de processar

---

## 10. Plano de Desenvolvimento (Fases)

| Fase | Escopo | Status |
|------|--------|--------|
| 1 | Monorepo foundation, shared, database, Prisma schema | ✅ Concluída |
| 2 | apps/api — Fastify, rotas base, BullMQ, health check | ⏳ Próxima |
| 3 | packages/whatsapp, ai, erp — integrações core | ⬜ Pendente |
| 4 | Worker principal — fluxo end-to-end completo | ⬜ Pendente |
| 5 | apps/web — Next.js, dashboard, auth, páginas | ⬜ Pendente |
| 6 | Fluxos secundários — inadimplência, ruptura, relatório | ⬜ Pendente |

---

## 11. Como Rodar Localmente

```bash
# 1. Instalar dependências
pnpm install

# 2. Copiar e preencher variáveis
cp .env.example .env

# 3. Subir PostgreSQL e Redis (Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=flowops postgres:16
docker run -d -p 6379:6379 redis:7

# 4. Gerar Prisma client e rodar migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed de desenvolvimento
pnpm db:seed
# Login: dev@flowops.app / flowops123

# 6. Rodar em desenvolvimento
pnpm dev
# API:  http://localhost:3001
# Web:  http://localhost:3000
```
