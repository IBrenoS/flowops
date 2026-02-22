import { PrismaClient, Plan, UserRole, FlowStatus, WaStatus } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Simula hash de senha — em produção use bcrypt
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Seeding database...')

  // Tenant de desenvolvimento
  const tenant = await prisma.tenant.upsert({
    where: { email: 'dev@flowops.app' },
    update: {},
    create: {
      name: 'Distribuidora Demo',
      email: 'dev@flowops.app',
      passwordHash: hashPassword('flowops123'),
      plan: Plan.GROWTH,

      users: {
        create: {
          name: 'Admin Demo',
          email: 'admin@flowops.app',
          role: UserRole.ADMIN,
        },
      },

      whatsappInstance: {
        create: {
          instanceId: 'flowops-dev-demo',
          status: WaStatus.DISCONNECTED,
        },
      },

      flows: {
        create: [
          {
            name: 'Pedido WhatsApp → Bling',
            description: 'Converte mensagens do WhatsApp em pedidos de venda no Bling',
            status: FlowStatus.ACTIVE,
            steps: [
              { id: 'step-1', type: 'trigger', name: 'WhatsApp · Mensagem recebida', config: {} },
              { id: 'step-2', type: 'action',  name: 'OpenAI · Extrair pedido',      config: { model: 'gpt-4o-mini' } },
              { id: 'step-3', type: 'condition', name: 'Confiança ≥ 70%?',           config: { threshold: 0.70 } },
              { id: 'step-4', type: 'action',  name: 'Bling · Criar pedido de venda', config: {} },
              { id: 'step-5', type: 'action',  name: 'WhatsApp · Confirmar pedido',   config: {} },
            ],
            runCount: 0,
            successRate: 0,
          },
        ],
      },
    },
  })

  console.log(`✅ Tenant criado: ${tenant.name} (${tenant.email})`)
  console.log('🔑 Login: dev@flowops.app / flowops123')
  console.log('✅ Seed concluído!')
}

main()
  .catch(e => {
    console.error('❌ Seed falhou:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
