"use client"
import { useState } from 'react'

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('DISCOVERY')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, status })
    })
    if (res.ok) {
      const j = await res.json()
      window.location.href = `/projects/${j.id}`
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Failed')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>New Project</h1>
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
        <button type="submit">Create</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
