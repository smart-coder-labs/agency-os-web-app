"use client"
import { useEffect, useState } from 'react'

export default function UiSpecsPage({ params }: { params: { id: string } }) {
  const projectId = params.id
  const [designSystem, setDesignSystem] = useState('{}')
  const [components, setComponents] = useState('[]')
  const [wireframes, setWireframes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const r = await fetch(`/api/ui-specs/${projectId}`)
      if (r.ok) {
        const u = await r.json()
        setDesignSystem(JSON.stringify(u.design_system ?? {}))
        setComponents(JSON.stringify(u.components ?? []))
        setWireframes(u.wireframes_md || '')
      }
    })()
  }, [projectId])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch(`/api/ui-specs/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design_system: JSON.parse(designSystem || '{}'), components: JSON.parse(components || '[]'), wireframes_md: wireframes })
    })
    if (!res.ok) setError('Failed to save')
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>UI Specs</h1>
      <form onSubmit={onSave} style={{ display: 'grid', gap: 12 }}>
        <label>Design System (JSON) <textarea value={designSystem} onChange={(e) => setDesignSystem(e.target.value)} rows={6} /></label>
        <label>Components (JSON) <textarea value={components} onChange={(e) => setComponents(e.target.value)} rows={6} /></label>
        <label>Wireframes (MD) <textarea value={wireframes} onChange={(e) => setWireframes(e.target.value)} rows={6} /></label>
        <button type="submit">Save</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
