'use server'

import { createClient } from '@/lib/supabase/server'
import type { SeatingTableData } from './types'

async function getPlanId(slug: string): Promise<string | null> {
  const supabase = await createClient()
  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return null
  const { data: plan } = await supabase
    .from('seating_plans').select('id').eq('wedding_id', wedding.id).single()
  return plan?.id ?? null
}

export async function saveTable(slug: string, table: SeatingTableData) {
  const supabase = await createClient()
  const planId = await getPlanId(slug)
  if (!planId) return
  await supabase.from('seating_tables').upsert({
    id: table.id,
    plan_id: planId,
    type: table.type,
    name: table.name,
    x: table.x,
    y: table.y,
    seat_count: table.seatCount,
    seats: table.seats,
  })
}

export async function deleteTable(slug: string, tableId: string) {
  const supabase = await createClient()
  await supabase.from('seating_tables').delete().eq('id', tableId)
}

export async function updateTablePosition(_slug: string, tableId: string, x: number, y: number) {
  const supabase = await createClient()
  await supabase.from('seating_tables').update({ x, y }).eq('id', tableId)
}
