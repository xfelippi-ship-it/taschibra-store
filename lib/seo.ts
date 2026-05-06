/**
 * Gerador de SEO automático para produtos Taschibra.
 * Monta título e descrição baseados em template, dentro dos limites
 * recomendados pelo Google (título 60 chars, descrição 160 chars).
 */

interface ProdutoSEO {
  name?: string
  description?: string
  power_w?: number
  voltage?: string
  color_temp_k?: number
  ip_rating?: string
  category_slug?: string
  family?: string
}

const BRAND = 'Taschibra'

/**
 * Mapeia category_slug para sugestão de ambiente.
 * Usado quando produto não tem descrição manual.
 */
const AMBIENTE_POR_CATEGORIA: Record<string, string> = {
  'ambientes/teto': 'sala, cozinha e área de circulação',
  'ambientes/mesa-sala': 'sala de estar e mesa',
  'ambientes/parede': 'quarto, sala e corredor',
  'ambientes/externo': 'área externa, varanda e jardim',
  'ambientes/piso': 'jardim e iluminação de piso',
  'lampadas/bulbo': 'qualquer ambiente com soquete E27',
  'lampadas/dicroica': 'spots, trilhos e iluminação direcional',
  'lampadas/tubular': 'cozinha, área de serviço e comércio',
  'lampadas/filamento': 'ambiente decorativo e vintage',
  'smart/lampadas-smart': 'controle por aplicativo e voz',
  'profissional/refletor-pro': 'área externa, esportiva e industrial',
  'profissional/high-bay': 'galpões, indústrias e áreas com pé-direito alto',
}

/**
 * Trunca string mantendo palavras inteiras (sem cortar no meio).
 */
function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  const truncated = str.slice(0, max)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()
}

/**
 * Gera o título SEO do produto (max 60 chars).
 *
 * Formato: "{Nome} {Potência}W {TempCor}K | Taschibra"
 * Exemplo: "Plafon Waffle 4xE27 60W 6500K | Taschibra"
 */
export function generateSEOTitle(p: ProdutoSEO): string {
  if (!p.name) return BRAND
  const partes = [p.name]
  if (p.power_w) partes.push(`${p.power_w}W`)
  if (p.color_temp_k) partes.push(`${p.color_temp_k}K`)
  const semBrand = partes.join(' ')
  const comBrand = `${semBrand} | ${BRAND}`
  // Se passar de 60 chars, tenta sem temperatura, depois sem potência
  if (comBrand.length <= 60) return comBrand
  const semTemp = `${[p.name, p.power_w ? `${p.power_w}W` : ''].filter(Boolean).join(' ')} | ${BRAND}`
  if (semTemp.length <= 60) return semTemp
  const soNome = `${p.name} | ${BRAND}`
  if (soNome.length <= 60) return soNome
  // Último caso: trunca o nome
  const espacoBrand = ` | ${BRAND}`
  return truncate(p.name, 60 - espacoBrand.length) + espacoBrand
}

/**
 * Gera a descrição SEO do produto (max 160 chars).
 *
 * Se tiver descrição manual, usa as primeiras 160 chars limpas.
 * Senão, monta com nome + specs + ambiente sugerido + CTA.
 */
export function generateSEODescription(p: ProdutoSEO): string {
  // Se tem descrição própria, usa (limpa HTML, trunca)
  if (p.description) {
    const limpa = p.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (limpa.length >= 60) return truncate(limpa, 160)
  }

  // Caso contrário, monta automático
  const partes: string[] = []
  if (p.name) partes.push(p.name)

  // Specs técnicas
  const specs: string[] = []
  if (p.power_w) specs.push(`${p.power_w}W`)
  if (p.voltage) specs.push(p.voltage)
  if (p.color_temp_k) specs.push(`${p.color_temp_k}K`)
  if (p.ip_rating) specs.push(p.ip_rating)
  if (specs.length > 0) {
    partes.push(`com ${specs.join(', ')}`)
  }

  // Ambiente sugerido baseado em categoria
  if (p.category_slug && AMBIENTE_POR_CATEGORIA[p.category_slug]) {
    partes.push(`Ideal para ${AMBIENTE_POR_CATEGORIA[p.category_slug]}`)
  }

  const inicio = partes.join('. ').replace(/\.+/g, '.').trim()
  const cta = `Compre na loja oficial ${BRAND} com garantia e entrega para todo Brasil.`
  const completa = inicio ? `${inicio}. ${cta}` : cta

  return truncate(completa, 160)
}

/**
 * Função principal: retorna {title, description} prontos para usar.
 */
export function generateSEO(p: ProdutoSEO): { title: string; description: string } {
  return {
    title: generateSEOTitle(p),
    description: generateSEODescription(p),
  }
}
