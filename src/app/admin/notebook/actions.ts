'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addNote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const title = (formData.get('title') as string | null)?.trim() || null
  const content = (formData.get('content') as string | null)?.trim()
  const tagsRaw = (formData.get('tags') as string | null) ?? ''
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)

  if (!content) return

  await supabase.from('admin_notes').insert({
    admin_user_id: user.id,
    title,
    content,
    tags,
  })

  revalidatePath('/admin/notebook')
}

export async function deleteNote(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('admin_notes').delete().eq('id', id).eq('admin_user_id', user.id)
  revalidatePath('/admin/notebook')
}

export async function updateNote(id: string, title: string | null, content: string, tags: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('admin_notes')
    .update({ title: title || null, content, tags, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('admin_user_id', user.id)

  revalidatePath('/admin/notebook')
}
