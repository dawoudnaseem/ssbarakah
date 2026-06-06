export default function TeammatePage({ params }: { params: { teammateId: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#061826', color: '#F2FBFF' }}>
      <p>Teammate dashboard coming soon — ID: {params.teammateId}</p>
    </main>
  )
}
