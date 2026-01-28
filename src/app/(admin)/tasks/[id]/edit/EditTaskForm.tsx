"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditTaskForm({ task }: { task: any }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('GENERAL')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setType(task.type || 'GENERAL')
      setStatus(task.status || 'TODO')
      setPriority(task.priority ?? 1)
    }
  }, [task])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, type, status, priority })
    })
    if (res.ok) {
        router.push(`/tasks/${task.id}`)
        router.refresh()
    } else {
        setError('Failed to update')
    }
  }

  async function onDelete() {
    if (!confirm('Delete task?')) return
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    if (res.ok) {
        router.push('/tasks')
        router.refresh()
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Edit Task</h1>
      <form onSubmit={onSave} style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>Title <input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
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
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit">Save</button>
          <button type="button" style={{ color: 'crimson' }} onClick={onDelete}>Delete</button>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
