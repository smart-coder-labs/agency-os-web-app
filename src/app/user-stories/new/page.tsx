"use client"
import { useState } from 'react'

export default function NewStory() {
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [benefit, setBenefit] = useState('')
  const [status, setStatus] = useState('PENDING')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/user-stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, role, goal, benefit, status, project_id: projectId || null })
    })
    if (res.ok) {
      const j = await res.json()
      location.href = `/user-stories/${j.id}`
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Failed')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>New Story</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Role <input value={role} onChange={(e) => setRole(e.target.value)} /></label>
        <label>Goal <textarea value={goal} onChange={(e) => setGoal(e.target.value)} /></label>
        <label>Benefit <textarea value={benefit} onChange={(e) => setBenefit(e.target.value)} /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>PENDING</option>
            <option>READY</option>
            <option>DONE</option>
          </select>
        </label>
        <label>Project ID (optional) <input value={projectId} onChange={(e) => setProjectId(e.target.value)} /></label>
        <button type="submit">Create</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
