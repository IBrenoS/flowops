// @flowops/erp — implementado na Fase 3
// Responsabilidade: IERPAdapter interface + adaptadores Bling, Omie, Tiny

import type { ERPOrder, ERPOrderResult, ERPType } from '@flowops/shared'

// ─────────────────────────────────────────────────────────────────────────────
// IERPAdapter — contrato que TODOS os adaptadores devem implementar
// Adicionar um novo ERP = implementar esta interface
// ─────────────────────────────────────────────────────────────────────────────
export interface IERPAdapter {
  readonly type: ERPType

  /** Verifica se a conexão está ativa e o token é válido */
  testConnection(): Promise<boolean>

  /** Busca cliente pelo telefone ou nome parcial */
  findClient(query: string): Promise<{ id: string; name: string } | null>

  /** Cria pedido de venda — idempotente via ERPOrder.externalRef */
  createOrder(order: ERPOrder): Promise<ERPOrderResult>

  /** Verifica limite de crédito do cliente antes de criar o pedido */
  checkCredit(clientId: string): Promise<{ available: boolean; limit?: number }>
}

export {}
