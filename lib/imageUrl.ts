/**
 * Helper para gerar URLs de imagem otimizadas do Supabase Storage.
 *
 * Por padrão, o Supabase serve a imagem original (1200x1200px, ~70KB).
 * Esta função usa o endpoint /render/image que faz resize on-the-fly,
 * reduzindo o tamanho da imagem para o necessário em cada contexto.
 *
 * Uso:
 *   <img src={getImageUrl(produto.main_image, 400)} />
 *
 * Tamanhos recomendados por contexto:
 *   - Card produto (home/PLP): 400px
 *   - Miniatura backoffice/carrinho: 150px
 *   - Imagem principal PDP: 800px
 *   - Zoom PDP: undefined (mantém original 1200px)
 */
export function getImageUrl(
  url: string | null | undefined,
  width?: number,
  quality: number = 80
): string {
  if (!url) return ''

  // Se for null, undefined ou string vazia, retorna vazio
  if (typeof url !== 'string' || url.trim() === '') return ''

  // Se não for URL do Supabase Storage, retorna original (logos, externos, etc.)
  if (!url.includes('/storage/v1/object/public/')) return url

  // Sem resize solicitado, retorna a URL original
  if (!width) return url

  // Converte /object/public/ para /render/image/public/ e adiciona params
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  const separator = transformedUrl.includes('?') ? '&' : '?'
  return `${transformedUrl}${separator}width=${width}&quality=${quality}`
}
