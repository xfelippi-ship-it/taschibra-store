// Helpers para detectar e processar tipos de midia em URLs

export type MediaType = 'image' | 'youtube' | 'vimeo' | 'video'

export function detectMediaType(url: string): MediaType {
  if (!url) return 'image'
  const u = url.toLowerCase().trim()
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('vimeo.com')) return 'vimeo'
  if (u.match(/\.(mp4|webm|ogg|mov)(\?|$)/)) return 'video'
  return 'image'
}

export function getYouTubeId(url: string): string | null {
  if (!url) return null
  // Suporta: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function getVimeoId(url: string): string | null {
  if (!url) return null
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null
}

export function getVimeoEmbedUrl(url: string): string | null {
  const id = getVimeoId(url)
  return id ? `https://player.vimeo.com/video/${id}` : null
}
