export type Wedding = {
  id: string
  slug: string
  partner1_name: string | null
  partner2_name: string | null
  family_name: string | null
  wedding_date: string | null
  venue_name: string | null
  venue_address: string | null
  dress_code: string | null
  notes: string | null
  couple_email: string | null
  couple_user_id: string | null
  created_at: string
  keepsake_sent_at: string | null
}

export type Guest = {
  id: string
  wedding_id: string
  full_name: string
  email: string | null
  phone: string | null
  table_number: number | null
  seat_number: number | null
  meal_choice: string | null
  dietary_restrictions: string | null
  rsvp_status: 'pending' | 'confirmed' | 'declined'
}

export type Vendor = {
  id: string
  wedding_id: string
  category: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

export type TimelineEvent = {
  id: string
  wedding_id: string
  time: string
  title: string
  description: string | null
  sort_order: number
}

export type BudgetItem = {
  id: string
  wedding_id: string
  category: string
  description: string
  estimated_cost: number
  actual_cost: number | null
  paid: boolean
  notes: string | null
}

export type Photo = {
  id: string
  wedding_id: string
  storage_path: string
  device_token: string
  uploaded_at: string
}

export type GuestCamera = {
  id: string
  wedding_id: string
  device_id: string
  shots_used: number
  created_at: string
  last_shot_at: string | null
}

export type GuestPhoto = {
  id: string
  wedding_id: string
  device_id: string
  storage_path: string
  uploaded_at: string
}
