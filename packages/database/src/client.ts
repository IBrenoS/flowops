import { PrismaClient } from '@prisma/client'

// Singleton seguro para desenvolvimento com HMR (Next.js / ts-node --watch)
// Em produção, sempre cria uma única instância

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient()

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma
}

// Re-export all Prisma types for convenience
export * from '@prisma/client'
export { Prisma } from '@prisma/client'
