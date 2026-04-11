export async function registrarAuditoria({
  executedBy,
  acao,
  entidade,
  detalhe,
  valorAntes,
  valorDepois,
}: {
  executedBy: string
  acao: string
  entidade: string
  detalhe?: string
  valorAntes?: Record<string, any>
  valorDepois?: Record<string, any>
}) {
  try {
    await fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executedBy, acao, entidade, detalhe, valorAntes, valorDepois })
    })
  } catch (e) {
    console.error('Erro ao registrar auditoria:', e)
  }
}
