import { redirect } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export default async function ChecklistRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/${slug}/manage`)
}
