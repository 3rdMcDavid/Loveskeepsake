import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SeatingPlanner } from './SeatingPlanner'
import type { SeatingTableData, Seat } from './types'

type Props = { params: Promise<{ slug: string }> }

export default async function SeatingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${slug}/sign-in`)

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, partner1_name, partner2_name, couple_email, couple_user_id')
    .eq('slug', slug)
    .single()

  if (!wedding) notFound()

  const isCouple =
    wedding.couple_user_id === user.id ||
    (!wedding.couple_user_id && wedding.couple_email === user.email)
  if (!isCouple) redirect('/')

  // Claim couple_user_id if not yet set
  if (!wedding.couple_user_id) {
    await supabase.from('weddings').update({ couple_user_id: user.id }).eq('id', wedding.id)
  }

  // Get or create seating plan
  let { data: plan } = await supabase
    .from('seating_plans')
    .select('id')
    .eq('wedding_id', wedding.id)
    .single()

  if (!plan) {
    const { data: newPlan } = await supabase
      .from('seating_plans')
      .insert({ wedding_id: wedding.id })
      .select('id')
      .single()
    plan = newPlan
  }

  if (!plan) notFound()

  const { data: rows } = await supabase
    .from('seating_tables')
    .select('id, type, name, x, y, seat_count, seats')
    .eq('plan_id', plan.id)
    .order('created_at')

  const tables: SeatingTableData[] = (rows ?? []).map(r => ({
    id: r.id,
    type: r.type as 'round' | 'square',
    name: r.name,
    x: r.x,
    y: r.y,
    seatCount: r.seat_count,
    seats: (r.seats ?? []) as Seat[],
  }))

  const { data: guests } = await supabase
    .from('guests')
    .select('full_name')
    .eq('wedding_id', wedding.id)
    .order('full_name')

  const guestNames = (guests ?? []).map((g: { full_name: string }) => g.full_name).filter(Boolean)
  const coupleNames = wedding.partner2_name
    ? `${wedding.partner1_name} & ${wedding.partner2_name}`
    : (wedding.partner1_name ?? 'Your Wedding')

  return (
    <SeatingPlanner
      slug={slug}
      initialTables={tables}
      guestNames={guestNames}
      coupleNames={coupleNames}
    />
  )
}
