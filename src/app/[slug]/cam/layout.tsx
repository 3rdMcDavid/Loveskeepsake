export default function CamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#0a0806', color: '#faf8f5' }}>
      {children}
    </div>
  )
}
