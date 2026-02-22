# FlowOps — WORKFLOW.md
> Protocolo obrigatório para todas as tarefas de desenvolvimento.
> O agente NÃO avança de etapa sem aprovação explícita.

---

## Regra Absoluta

**Silêncio não é aprovação.** Espere confirmação explícita antes de avançar.

---

## As 6 Etapas

### ETAPA 1 — Análise de Escopo
Antes de qualquer coisa:
1. Leia `CONTEXT.md` completo
2. Leia `WORKFLOW.md` (este arquivo)
3. Liste todos os arquivos que serão criados ou modificados
4. Identifique riscos e dependências entre tarefas
5. Aponte qualquer ambiguidade ou conflito com o que está no CONTEXT.md

> ⛔ NÃO crie nem modifique nenhum arquivo nesta etapa

---

### ETAPA 2 — Roadmap por Fases
Quebre a tarefa em fases pequenas e independentes:
- Cada fase deve ser entregável e testável de forma isolada
- Defina critério claro de conclusão para cada fase
- Se a tarefa for simples (1-2 arquivos), pode ter fase única

> ⛔ Aguarde aprovação do roadmap antes de continuar

---

### ETAPA 3 — Plano Detalhado da Fase Atual
Para a fase que será implementada:
- Descreva cada arquivo: caminho, responsabilidade, assinaturas de funções
- Descreva a lógica principal — sem escrever código ainda
- Liste imports e dependências entre os arquivos da fase
- Confirme alinhamento com types em `packages/shared`

> ⛔ Aguarde aprovação do plano antes de continuar

---

### ETAPA 4 — Aprovação
Apresente um resumo conciso:
```
Pronto para implementar:
- [ ] arquivo1.ts — descrição
- [ ] arquivo2.ts — descrição

Confirma?
```

> ⛔ Aguarde "aprovado" explícito. Qualquer ajuste reinicia a Etapa 3.

---

### ETAPA 5 — Implementação
- Implemente EXATAMENTE o que foi aprovado no plano
- Se encontrar um bloqueio ou ambiguidade: PARE e reporte
- Não expanda escopo sem nova aprovação
- Siga todas as convenções do CONTEXT.md seção 9

> ✅ Pode criar e modificar arquivos nesta etapa

---

### ETAPA 6 — Revisão + QA

Após implementar, execute o checklist:

**TypeScript:**
- [ ] `tsc --noEmit` sem erros no package modificado
- [ ] Zero uso de `any` ou `as unknown as`
- [ ] Tipos importados de `@flowops/shared` onde aplicável

**Qualidade:**
- [ ] Todos os erros tratados com try/catch tipado
- [ ] Sem `console.log` — use logger do Fastify ou `process.env` checks
- [ ] Sem segredos hardcoded (API keys, passwords, tokens)
- [ ] Inputs externos validados com Zod

**Funcionalidade:**
- [ ] Lógica de idempotência respeitada (Order.messageId)
- [ ] Thresholds de confiança corretos (HIGH=0.85, MEDIUM=0.70)
- [ ] Rotas seguem a convenção da seção 6 do CONTEXT.md

**Entrega:**
- [ ] Descreva o que foi feito
- [ ] Liste o que NÃO foi feito (se houver)
- [ ] Sugira próxima fase se aplicável

---

## Erros Comuns — Nunca Faça

| ❌ Errado | ✅ Correto |
|-----------|-----------|
| Expor instanceId/URL da Evolution API ao usuário | QR code apenas |
| Processar webhook de forma síncrona | Sempre enfileirar no BullMQ primeiro |
| Usar text completion para extrair pedidos | Sempre function calling com schema Zod |
| Criar Order duplicada para o mesmo messageId | Verificar unicidade antes de criar |
| Usar `any` no TypeScript | Tipar explicitamente ou usar `unknown` |
| Hardcodar thresholds de confiança | Usar `CONFIDENCE_THRESHOLDS` de `@flowops/shared` |
| Avançar de etapa sem aprovação | Aguardar confirmação explícita |
