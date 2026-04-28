'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export type CreateWeddingResult =
  | { status: 'success'; weddingId: string; email: string; password: string; slug: string }
  | { status: 'error'; message: string }

export async function createWedding(
  _prev: CreateWeddingResult | null,
  formData: FormData
): Promise<CreateWeddingResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Unauthorized' }

  const couple_name  = formData.get('couple_name') as string
  const couple_email = formData.get('couple_email') as string

  let slug = toSlug(couple_name)
  const { count } = await supabase
    .from('weddings')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
  if (count && count > 0) slug = `${slug}-${Date.now()}`

  const password = generatePassword()
  const admin = createAdminClient()

  const { data: newUser, error: userError } = await admin.auth.admin.createUser({
    email: couple_email,
    password,
    email_confirm: true,
  })

  if (userError) return { status: 'error', message: userError.message }

  const { data: wedding, error } = await supabase
    .from('weddings')
    .insert({
      slug,
      partner1_name: couple_name,
      partner2_name: null,
      wedding_date: null,
      couple_email,
      couple_user_id: newUser.user.id,
    })
    .select('id')
    .single()

  if (error) {
    await admin.auth.admin.deleteUser(newUser.user.id)
    return { status: 'error', message: error.message }
  }

  return { status: 'success', weddingId: wedding.id, email: couple_email, password, slug }
}
