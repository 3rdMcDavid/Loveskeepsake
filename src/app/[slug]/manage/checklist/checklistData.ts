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
  customRoute?: string  // points to /[slug]/manage/{customRoute}
  hidden?: true         // omit from nav and progress entirely
}

export const SECTIONS: ChecklistSection[] = [
  // ── index 0 ─────────────────────────────────────────────────────
  {
    title: 'Wedding Venues',
    script: 'Comparison',
    icon: '🏛️',
    tabLabel: 'Venues',
    customRoute: 'venues',
    groups: [],
  },
  // ── index 1 ─────────────────────────────────────────────────────
  {
    title: 'Bride & Groom',
    script: 'Attire',
    icon: '💍',
    tabLabel: 'Attire',
    customRoute: 'attire',
    groups: [],
  },
  // ── index 2 ─────────────────────────────────────────────────────
  {
    title: 'Budget',
    script: 'Planner',
    icon: '💰',
    tabLabel: 'Budget',
    hidden: true,
    groups: [],
  },
  // ── index 3 ─────────────────────────────────────────────────────
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
  // ── index 4 ─────────────────────────────────────────────────────
  {
    title: 'Rehearsal',
    script: 'Dinner',
    icon: '🥂',
    tabLabel: 'Rehearsal',
    customRoute: 'rehearsal',
    groups: [],
  },
  // ── index 5 ─────────────────────────────────────────────────────
  {
    title: 'Guest',
    script: 'List',
    icon: '📋',
    tabLabel: 'Guest List',
    customRoute: 'guest-list',
    groups: [],
  },
  // ── index 6 ─────────────────────────────────────────────────────
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
          { label: "Get a good night's sleep" },
        ],
      },
    ],
  },
  // ── index 7 ─────────────────────────────────────────────────────
  {
    title: 'Wedding Guest',
    script: 'Checklist',
    icon: '👥',
    tabLabel: 'Guests',
    hidden: true,
    groups: [],
  },
  // ── index 8 ─────────────────────────────────────────────────────
  {
    title: 'Expense',
    script: 'Tracker',
    icon: '📊',
    tabLabel: 'Expenses',
    customRoute: 'expenses',
    groups: [],
  },
  // ── index 9 ─────────────────────────────────────────────────────
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
  // ── index 10 ────────────────────────────────────────────────────
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
  removed: string[]
  added: CustomAddedItem[]
}

export type CustomConfig = Record<string, SectionConfig>

export interface PlanConfig {
  mode?: 'preset' | 'scratch'
  hiddenSections?: number[]
}

// ── Effective item types ─────────────────────────────────────────────────────

export interface EffectiveItem {
  key: string
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
  mode: 'preset' | 'scratch' = 'preset',
): EffectiveGroup[] {
  const cfg = customConfig[`s${si}`]
  const added = cfg?.added ?? []
  // scratch mode: treat all preset items as removed
  const removed = mode === 'scratch'
    ? new Set(section.groups.flatMap((g, gi) => g.items.map((_, ii) => `g${gi}_i${ii}`)))
    : new Set(cfg?.removed ?? [])

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

// Only count checklist sections (no customRoute, no hidden)
export function sectionProgress(
  si: number,
  state: Record<string, Record<string, boolean>>,
  customConfig: CustomConfig,
  hiddenSections: number[] = [],
  mode: 'preset' | 'scratch' = 'preset',
) {
  const sec = SECTIONS[si]
  if (sec.customRoute || sec.hidden || hiddenSections.includes(si)) return { total: 0, done: 0, pct: 0 }
  const groups = getEffectiveGroups(sec, si, customConfig, mode)
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
  hiddenSections: number[] = [],
  mode: 'preset' | 'scratch' = 'preset',
) {
  let total = 0, done = 0
  SECTIONS.forEach((sec, si) => {
    if (sec.customRoute || sec.hidden || hiddenSections.includes(si)) return
    const sp = sectionProgress(si, state, customConfig, hiddenSections, mode)
    total += sp.total
    done += sp.done
  })
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}
