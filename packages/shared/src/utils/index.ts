import { ConfidenceLevel } from '../types'
import { CONFIDENCE_THRESHOLDS } from '../constants'

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPhone(phone: string): string {
  // Normalize: remove non-digits, ensure country code
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`
  if (digits.length === 11 || digits.length === 10) return `+55${digits}`
  return `+${digits}`
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = formatPhone(phone).replace('+55', '')
  if (normalized.length === 11) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`
  }
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`
  }
  return phone
}

// ─────────────────────────────────────────────────────────────────────────────
// AI / Confidence
// ─────────────────────────────────────────────────────────────────────────────

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH)   return 'high'
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

export function shouldAutoProcess(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLDS.MEDIUM
}

// ─────────────────────────────────────────────────────────────────────────────
// Async
// ─────────────────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < attempts - 1) await sleep(delayMs * Math.pow(2, i))
    }
  }
  throw lastError
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrays
// ─────────────────────────────────────────────────────────────────────────────

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function dedupe<T>(array: T[]): T[] {
  return [...new Set(array)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Timing
// ─────────────────────────────────────────────────────────────────────────────

export function durationMs(startTime: number): number {
  return Date.now() - startTime
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

// ─────────────────────────────────────────────────────────────────────────────
// Strings
// ─────────────────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 3)}...`
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
