"use client"
import { useEffect, useState, use } from 'react'

export default function EditStory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [benefit, setBenefit] = useState('')
  const [status, setStatus] = useState('PENDING')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const r = await fetch(`/api/user-stories/${id}`)
      if (r.ok) {
        const s = await r.json()
        setTitle(s.title || '')
        setRole(s.role || '')
        setGoal(s.goal || '')
        setBenefit(s.benefit || '')
        setStatus(s.status || 'PENDING')
      }
    })()
  }, [id])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch(`/api/user-stories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, role, goal, benefit, status })
    })
    if (res.ok) location.href = `/user-stories/${id}`
    else setError('Failed to update')
  }

  async function onDelete() {
    if (!confirm('Delete story?')) return
    const res = await fetch(`/api/user-stories/${id}`, { method: 'DELETE' })
    if (res.ok) location.href = '/user-stories'
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit Story</h1>
      <form onSubmit={onSave} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
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
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit">Save</button>
          <button type="button" style={{ color: 'crimson' }} onClick={onDelete}>Delete</button>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
