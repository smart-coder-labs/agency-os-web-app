"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Trash2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Combobox } from '@/shared/components/ui/Combobox'
import { toast } from 'sonner'

export default function EditTaskForm({ task }: { task: any }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('GENERAL')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setType(task.type || 'GENERAL')
      setStatus(task.status || 'TODO')
      setPriority(task.priority ?? 1)
    }
  }, [task])

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ]

  const typeOptions = [
    { value: 'GENERAL', label: 'General' },
    { value: 'BUG', label: 'Bug' },
    { value: 'FEATURE', label: 'Feature' },
    { value: 'RESEARCH', label: 'Research' },
  ]

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, type, status, priority })
      })

      if (res.ok) {
        toast.success('Task updated successfully')
        router.push(`/tasks/${task.id}`)
        router.refresh()
      } else {
        toast.error('Failed to update task')
      }
    } catch (err) {
      toast.error('An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <SectionHeader
        title="Edit Task"
        description={`Update details for: ${task.title}`}
        actions={
          <Button 
            variant="secondary" 
            leftIcon={<ArrowLeft className="w-4 h-4" />} 
            onClick={() => router.back()}
          >
            Back
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-border-primary/50 shadow-2xl bg-white/70 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={onSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <Input
                    label="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Implement authentication flow"
                    required
                    inputSize="lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what needs to be done..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                   <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
                   <Combobox 
                    items={typeOptions}
                    value={type}
                    onChange={setType}
                    placeholder="Select type"
                   />
                </div>

                <div className="space-y-2">
                   <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                   <Combobox 
                    items={statusOptions}
                    value={status}
                    onChange={setStatus}
                    placeholder="Select status"
                   />
                </div>

                <div>
                   <Input
                    label="Priority"
                    type="number"
                    min={1}
                    max={5}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                    helperText="1 (Low) to 5 (Urgent)"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-border-primary/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isDeleting}
                    leftIcon={<Save className="w-4 h-4" />}
                    fullWidth
                    className="sm:w-48"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

