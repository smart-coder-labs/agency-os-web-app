"use client"
import { use, useEffect, useState } from 'react'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('DISCOVERY')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const res = await fetch(`/api/projects/${id}`)
      if (res.ok) {
        const p = await res.json()
        setName(p.name || '')
        setDescription(p.description || '')
        setStatus(p.status || 'DISCOVERY')
      }
    })()
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, status })
    })
    if (res.ok) {
      location.href = `/projects/${id}`
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Failed to update')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit Project</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>Name <input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Description <textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>DISCOVERY</option>
            <option>IN_PROGRESS</option>
            <option>PAUSED</option>
            <option>DONE</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit">Save</button>
          <button type="button" style={{ color: 'crimson' }} onClick={async () => {
            if (!confirm('Delete project?')) return
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
            if (res.ok) location.href = '/projects'
          }}>Delete</button>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
