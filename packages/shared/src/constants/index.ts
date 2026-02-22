// ─────────────────────────────────────────────────────────────────────────────
// Confidence Thresholds
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,    // cria no ERP automaticamente
  MEDIUM: 0.70,  // cria no ERP com alerta no dashboard
  // abaixo de MEDIUM → status 'review', aguarda humano
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Queue Names (BullMQ)
// ─────────────────────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  PROCESS_ORDER: 'process-order',
  SEND_WHATSAPP: 'send-whatsapp',
  SYNC_ERP:      'sync-erp',
  NOTIFY:        'notify',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Job Retry Config
// ─────────────────────────────────────────────────────────────────────────────

export const JOB_ATTEMPTS = {
  DEFAULT:  3,
  CRITICAL: 5,
  WEBHOOK:  1,   // webhooks não fazem retry — Evolution API já reenvia
} as const

export const JOB_BACKOFF = {
  TYPE: 'exponential' as const,
  DELAY: 2000, // ms — dobra a cada tentativa: 2s, 4s, 8s
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Plan Limits
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  starter: {
    flows: 1,
    ordersPerMonth: 500,
    erpConnections: 1,
  },
  growth: {
    flows: 5,
    ordersPerMonth: 2000,
    erpConnections: 2,
  },
  pro: {
    flows: Infinity,
    ordersPerMonth: Infinity,
    erpConnections: Infinity,
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Event Steps (OrderEvent.step)
// ─────────────────────────────────────────────────────────────────────────────

export const ORDER_STEPS = {
  WEBHOOK_RECEIVED:  'webhook_received',
  JOB_QUEUED:        'job_queued',
  AUDIO_TRANSCRIBED: 'audio_transcribed',
  AI_EXTRACTED:      'ai_extracted',
  ERP_VALIDATED:     'erp_validated',
  ERP_CREATED:       'erp_created',
  WA_CONFIRMED:      'wa_confirmed',
  REVIEW_REQUIRED:   'review_required',
  ERROR:             'error',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Status Codes (usados em respostas padronizadas)
// ─────────────────────────────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  TOO_MANY_REQUESTS:     429,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Error Codes (ApiResponse.error.code)
// ─────────────────────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  INVALID_CREDENTIALS:  'INVALID_CREDENTIALS',
  TOKEN_EXPIRED:        'TOKEN_EXPIRED',
  NOT_FOUND:            'NOT_FOUND',
  ALREADY_EXISTS:       'ALREADY_EXISTS',
  PLAN_LIMIT_REACHED:   'PLAN_LIMIT_REACHED',
  ERP_CONNECTION_ERROR: 'ERP_CONNECTION_ERROR',
  AI_EXTRACTION_ERROR:  'AI_EXTRACTION_ERROR',
  WHATSAPP_ERROR:       'WHATSAPP_ERROR',
  VALIDATION_ERROR:     'VALIDATION_ERROR',
  INTERNAL_ERROR:       'INTERNAL_ERROR',
} as const
