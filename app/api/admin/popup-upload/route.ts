import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Arquivo obrigatorio' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = 'popup-' + Date.now() + '.' + ext
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await supabase.storage
      .from('popup-images')
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadErr) throw uploadErr

    const { data: urlData } = supabase.storage.from('popup-images').getPublicUrl(filename)

    return NextResponse.json({ ok: true, url: urlData.publicUrl })
  } catch (err: any) {
    console.error('[popup-upload]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
