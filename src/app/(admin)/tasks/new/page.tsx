"use client"
import { useState } from 'react'

export default function NewTaskPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('GENERAL')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState(1)
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, type, status, priority, project_id: projectId || null })
    })
    if (res.ok) {
      const j = await res.json()
      location.href = `/tasks/${j.id}`
    } else {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Failed')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>New Task</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Description <textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Type <input value={type} onChange={(e) => setType(e.target.value)} /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>TODO</option>
            <option>IN_PROGRESS</option>
            <option>DONE</option>
          </select>
        </label>
        <label>Priority <input type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value, 10))} /></label>
        <label>Project ID (optional) <input value={projectId} onChange={(e) => setProjectId(e.target.value)} /></label>
        <button type="submit">Create</button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
