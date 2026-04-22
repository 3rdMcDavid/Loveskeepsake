export interface ChecklistItem {
  label: string
  sub?: string
}

export interface ChecklistGroup {
  label: string
  items: ChecklistItem[]
}

export interface ChecklistSection {
  title: string
  script: string
  icon: string
  tabLabel: string
  groups: ChecklistGroup[]
}

export const SECTIONS: ChecklistSection[] = [
  {
    title: 'Wedding Venues',
    script: 'Comparison',
    icon: '🏛️',
    tabLabel: 'Venues',
    groups: [
      {
        label: 'Research',
        items: [
          { label: 'Shortlist 3–5 venues', sub: 'Based on guest count & style' },
          { label: 'Book venue tours / site visits' },
          { label: 'Compare pricing & inclusions' },
          { label: 'Check date availability' },
          { label: 'Review venue contract terms' },
        ],
      },
      {
        label: 'Confirm',
        items: [
          { label: 'Sign venue contract' },
          { label: 'Pay deposit' },
          { label: 'Confirm guest capacity' },
          { label: 'Confirm parking & accessibility' },
        ],
      },
    ],
  },
  {
    title: 'Bride & Groom',
    script: 'Preparation',
    icon: '💍',
    tabLabel: 'Attire',
    groups: [
      {
        label: 'Attire',
        items: [
          { label: 'Choose wedding dress designer' },
          { label: 'Book first fitting appointment' },
          { label: 'Complete all dress alterations' },
          { label: 'Choose groom\'s suit / attire' },
          { label: 'Pick up final gown' },
        ],
      },
      {
        label: 'Bridal Party',
        items: [
          { label: 'Confirm bridesmaid dresses' },
          { label: 'Schedule bridesmaid fitting dates' },
          { label: 'Share day-of schedule with bridal party' },
          { label: 'Arrange groomsmen attire' },
        ],
      },
    ],
  },
  {
    title: 'Wedding Day',
    script: 'Budget Planner',
    icon: '💰',
    tabLabel: 'Budget',
    groups: [
      {
        label: 'Budget Setup',
        items: [
          { label: 'Set overall wedding budget' },
          { label: 'Allocate budget per category' },
          { label: 'Open dedicated wedding account' },
        ],
      },
      {
        label: 'Tracking',
        items: [
          { label: 'Log venue deposit payment' },
          { label: 'Log photographer payment' },
          { label: 'Log catering estimate' },
          { label: 'Log florist payment' },
          { label: 'Track all remaining vendor deposits' },
          { label: 'Reconcile final budget vs actual spend' },
        ],
      },
    ],
  },
  {
    title: 'After the',
    script: 'Wedding',
    icon: '✨',
    tabLabel: 'Post-Wedding',
    groups: [
      {
        label: 'Admin',
        items: [
          { label: 'Send thank-you cards to all guests' },
          { label: 'Return any hired items' },
          { label: 'Submit marriage certificate for name change' },
          { label: 'Update ID documents if applicable' },
        ],
      },
      {
        label: 'Keepsakes',
        items: [
          { label: 'Review & select final photo gallery' },
          { label: 'Order wedding album' },
          { label: 'Preserve wedding bouquet' },
          { label: 'Write reviews for vendors' },
          { label: 'Download guest photo bundle' },
        ],
      },
    ],
  },
  {
    title: 'Rehearsal',
    script: 'Dinner',
    icon: '🥂',
    tabLabel: 'Rehearsal',
    groups: [
      {
        label: 'Planning',
        items: [
          { label: 'Choose rehearsal dinner venue' },
          { label: 'Set rehearsal date & time' },
          { label: 'Finalise guest list for rehearsal' },
          { label: 'Choose food theme / menu' },
        ],
      },
      {
        label: 'Bookings',
        items: [
          { label: 'Make restaurant / venue reservation' },
          { label: 'Confirm dietary requirements' },
          { label: 'Arrange transport for wedding party' },
          { label: 'Pay rehearsal dinner deposit' },
        ],
      },
    ],
  },
  {
    title: 'Wedding Day',
    script: 'Guest List',
    icon: '📋',
    tabLabel: 'Guest List',
    groups: [
      {
        label: 'Invitations',
        items: [
          { label: 'Finalise guest list numbers' },
          { label: 'Collect all postal addresses' },
          { label: 'Design & order invitations' },
          { label: 'Send save-the-dates' },
          { label: 'Send formal invitations' },
        ],
      },
      {
        label: 'RSVPs',
        items: [
          { label: 'Set RSVP deadline' },
          { label: 'Chase outstanding RSVPs' },
          { label: 'Confirm final headcount with venue' },
          { label: 'Compile dietary requirements list' },
        ],
      },
    ],
  },
  {
    title: 'Wedding Planning',
    script: 'Checklist',
    icon: '📅',
    tabLabel: 'Planning',
    groups: [
      {
        label: '12 Months Before',
        items: [
          { label: 'Set a budget' },
          { label: 'Build initial guest list' },
          { label: 'Choose a wedding party' },
          { label: 'Book a wedding celebrant' },
          { label: 'Choose & book venue' },
        ],
      },
      {
        label: '6–9 Months Before',
        items: [
          { label: 'Book photographer & videographer' },
          { label: 'Send save-the-dates' },
          { label: 'Book hair & make-up artists' },
          { label: 'Start wedding dress shopping' },
          { label: 'Book caterer' },
        ],
      },
      {
        label: '3–6 Months Before',
        items: [
          { label: 'Choose colour scheme & florals' },
          { label: 'Book musicians / DJ' },
          { label: 'Order wedding cake' },
          { label: 'Book transport' },
          { label: 'Send formal invitations' },
        ],
      },
      {
        label: '1–3 Months Before',
        items: [
          { label: 'Finalise seating chart' },
          { label: 'Write vows' },
          { label: 'Hair & make-up trial' },
          { label: 'Confirm all vendor details' },
          { label: 'Prepare payments & tips for vendors' },
        ],
      },
      {
        label: 'Week Of & Night Before',
        items: [
          { label: 'Pick up wedding dress' },
          { label: 'Attend rehearsal' },
          { label: 'Pack honeymoon bags' },
          { label: 'Get a good night\'s sleep' },
        ],
      },
    ],
  },
  {
    title: 'Wedding Guest',
    script: 'Checklist',
    icon: '👥',
    tabLabel: 'Guests',
    groups: [
      {
        label: 'Tracking',
        items: [
          { label: 'All invitation addresses collected' },
          { label: 'Invitations posted' },
          { label: 'All RSVPs received' },
          { label: 'Seating chart finalised' },
          { label: 'Place cards printed' },
        ],
      },
      {
        label: 'Post-Wedding',
        items: [
          { label: 'Thank-you cards sent to all guests' },
          { label: 'Guest photo bundle shared' },
        ],
      },
    ],
  },
  {
    title: 'Expense',
    script: 'Tracker',
    icon: '📊',
    tabLabel: 'Expenses',
    groups: [
      {
        label: 'Key Payments',
        items: [
          { label: 'Venue deposit paid' },
          { label: 'Photographer deposit paid' },
          { label: 'Caterer deposit paid' },
          { label: 'Florist deposit paid' },
          { label: 'Music / DJ deposit paid' },
          { label: 'Dress paid in full' },
          { label: 'All final balances settled' },
        ],
      },
    ],
  },
  {
    title: 'Wedding',
    script: 'To-Do List',
    icon: '✅',
    tabLabel: 'To-Do',
    groups: [
      {
        label: 'Admin Tasks',
        items: [
          { label: 'Create wedding email address' },
          { label: 'Set up wedding website' },
          { label: 'Apply for marriage licence' },
          { label: 'Arrange wedding insurance' },
        ],
      },
      {
        label: 'Day-Of Prep',
        items: [
          { label: 'Pack bride & groom emergency kit' },
          { label: 'Confirm day-of timeline with all vendors' },
          { label: 'Assign someone to coordinate on the day' },
          { label: 'Prepare vendor payment envelopes' },
        ],
      },
    ],
  },
  {
    title: 'Preparation',
    script: 'Sketch',
    icon: '✏️',
    tabLabel: 'Prep',
    groups: [
      {
        label: 'Venue Layout',
        items: [
          { label: 'Finalise ceremony seating layout' },
          { label: 'Finalise reception table layout' },
          { label: 'Confirm décor placement with venue' },
          { label: 'Arrange signage & directional signs' },
        ],
      },
      {
        label: 'Visual Planning',
        items: [
          { label: 'Confirm colour palette with florist' },
          { label: 'Share décor mood board with venue stylist' },
          { label: 'Confirm centrepiece designs' },
          { label: 'Approve lighting plan' },
        ],
      },
    ],
  },
]

// ── Custom config types ──────────────────────────────────────────────────────

export interface CustomAddedItem {
  id: string
  gi: number
  label: string
}

export interface SectionConfig {
  removed: string[]                // default item keys like "g0_i2"
  added: CustomAddedItem[]
}

export type CustomConfig = Record<string, SectionConfig>  // keyed by "s0", "s1", …

// ── Effective item types ─────────────────────────────────────────────────────

export interface EffectiveItem {
  key: string       // "g0_i2" for defaults, UUID for custom
  label: string
  sub?: string
  isCustom: boolean
}

export interface EffectiveGroup {
  label: string
  items: EffectiveItem[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getEffectiveGroups(
  section: ChecklistSection,
  si: number,
  customConfig: CustomConfig,
): EffectiveGroup[] {
  const cfg = customConfig[`s${si}`]
  const removed = new Set(cfg?.removed ?? [])
  const added = cfg?.added ?? []

  return section.groups.map((g, gi) => {
    const defaults: EffectiveItem[] = g.items
      .map((item, ii) => ({
        key: `g${gi}_i${ii}`,
        label: item.label,
        sub: item.sub,
        isCustom: false,
      }))
      .filter(item => !removed.has(item.key))

    const customs: EffectiveItem[] = added
      .filter(a => a.gi === gi)
      .map(a => ({ key: a.id, label: a.label, isCustom: true }))

    return { label: g.label, items: [...defaults, ...customs] }
  })
}

export function sectionProgress(
  si: number,
  state: Record<string, Record<string, boolean>>,
  customConfig: CustomConfig,
) {
  const groups = getEffectiveGroups(SECTIONS[si], si, customConfig)
  let total = 0, done = 0
  groups.forEach(g =>
    g.items.forEach(item => {
      total++
      if (state[`s${si}`]?.[item.key]) done++
    }),
  )
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

export function computeProgress(
  state: Record<string, Record<string, boolean>>,
  customConfig: CustomConfig = {},
) {
  let total = 0, done = 0
  SECTIONS.forEach((_, si) => {
    const sp = sectionProgress(si, state, customConfig)
    total += sp.total
    done += sp.done
  })
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}
