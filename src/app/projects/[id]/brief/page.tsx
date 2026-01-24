"use client"
import { useEffect, useState } from 'react'

export default function ProjectBriefPage({ params }: { params: { id: string } }) {
  const projectId = params.id
  const [content, setContent] = useState('')
  const [goals, setGoals] = useState('[]')
  const [targetAudience, setTargetAudience] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const r = await fetch(`/api/project-briefs/${projectId}`)
      if (r.ok) {
        const b = await r.json()
        setContent(b.content || '')
        setGoals(JSON.stringify(b.goals ?? []))
        setTargetAudience(b.target_audience || '')
      }
    })()
  }, [projectId])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch(`/api/project-briefs/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, goals: JSON.parse(goals || '[]'), target_audience: targetAudience })
    })
    if (!res.ok) setError('Failed to save')
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Project Brief</h1>
      <form onSubmit={onSave} style={{ display: 'grid', gap: 12 }}>
        <label>Content <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} /></label>
        <label>Goals (JSON array) <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={4} /></label>
        <label>Target Audience <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} /></label>
        <button type="submit">Save</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
