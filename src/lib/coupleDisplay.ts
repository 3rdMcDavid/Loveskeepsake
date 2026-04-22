export function coupleDisplay(
  partner1: string | null | undefined,
  partner2: string | null | undefined,
  family: string | null | undefined,
): string {
  const first = [partner1, partner2].filter(Boolean).join(' & ')
  if (first && family) return `${first} ${family}`
  if (first) return first
  return family ?? 'Your Wedding'
}
