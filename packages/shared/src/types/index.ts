// ─────────────────────────────────────────────────────────────────────────────
// Domain Enums
// ─────────────────────────────────────────────────────────────────────────────

export type ERPType = 'bling' | 'omie' | 'tiny'

export type OrderStatus =
  | 'pending'      // recebido, aguardando processamento
  | 'processing'   // sendo processado pela IA
  | 'completed'    // criado no ERP com sucesso
  | 'review'       // confiança < 70%, aguarda revisão humana
  | 'failed'       // falhou após todas as tentativas

export type FlowStatus = 'active' | 'paused' | 'draft'

export type FlowStepType = 'trigger' | 'condition' | 'action'

export type ConfidenceLevel = 'high' | 'medium' | 'low'
// high   = confidence >= 0.85  → cria no ERP automaticamente
// medium = confidence >= 0.70  → cria no ERP automaticamente com alerta
// low    = confidence <  0.70  → encaminha para revisão humana

export type UserRole = 'admin' | 'member'

export type Plan = 'starter' | 'growth' | 'pro'

export type WaStatus = 'connected' | 'disconnected' | 'connecting'

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp
// ─────────────────────────────────────────────────────────────────────────────

export interface WebhookPayload {
  instanceId: string
  messageId: string
  from: string           // phone number with country code e.g. "5511999999999"
  body: string           // message text (empty if audio)
  timestamp: number      // unix timestamp
  type: 'text' | 'audio'
  audioUrl?: string      // URL to download audio file (if type === 'audio')
  pushName?: string      // contact name from WhatsApp
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Extraction
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtractedItem {
  productName: string
  quantity: number
  unit: string | null          // e.g. "caixa", "kg", "unidade"
  unitPrice: number | null     // null when not informed
  totalPrice: number | null    // quantity * unitPrice (if both available)
}

export interface ExtractedOrder {
  clientName: string | null
  clientPhone: string          // normalized phone
  items: ExtractedItem[]
  paymentCondition: string | null   // e.g. "30 dias", "à vista"
  deliveryAddress: string | null
  notes: string | null              // extra instructions from message
  confidence: number                // 0.0 – 1.0
  confidenceLevel: ConfidenceLevel
  rawMessage: string
  transcribedAudio?: string         // if original was audio, the transcription
}

export interface AIExtractionResult {
  success: boolean
  order?: ExtractedOrder
  error?: string
  tokensUsed?: number
  durationMs?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// ERP
// ─────────────────────────────────────────────────────────────────────────────

export interface ERPOrderItem {
  productId?: string
  productCode?: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface ERPOrder {
  clientId?: string
  clientName: string
  clientDocument?: string    // CPF/CNPJ
  items: ERPOrderItem[]
  paymentCondition?: string
  deliveryAddress?: string
  notes?: string
  externalRef: string        // flowops order ID for idempotency
}

export interface ERPOrderResult {
  erpOrderId: string         // ID no sistema ERP
  erpOrderRef: string        // referência legível e.g. "NV-00421"
  erpOrderUrl?: string       // link direto no ERP
}

// ─────────────────────────────────────────────────────────────────────────────
// Flow Builder
// ─────────────────────────────────────────────────────────────────────────────

export interface FlowStep {
  id: string
  type: FlowStepType
  name: string
  config: Record<string, unknown>
  onError?: 'stop' | 'continue' | 'notify'
}

export interface FlowDefinition {
  id: string
  name: string
  steps: FlowStep[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Jobs / Queue
// ─────────────────────────────────────────────────────────────────────────────

export interface ProcessOrderJobData {
  orderId: string
  tenantId: string
  webhookPayload: WebhookPayload
}

export interface SendWhatsAppJobData {
  tenantId: string
  to: string
  message: string
  orderId?: string
}

export interface SyncERPJobData {
  tenantId: string
  orderId: string
  erpType: ERPType
}

// ─────────────────────────────────────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
