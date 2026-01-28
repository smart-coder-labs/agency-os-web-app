"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Trash2, ArrowLeft, Briefcase } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Combobox } from '@/shared/components/ui/Combobox'
import { toast } from 'sonner'

export default function EditProjectForm({ project }: { project: any }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('DISCOVERY')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setDescription(project.description || '')
      setStatus(project.status || 'DISCOVERY')
    }
  }, [project])

  const statusOptions = [
    { value: 'DISCOVERY', label: 'Discovery' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'DONE', label: 'Done' },
  ]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, status })
      })

      if (res.ok) {
        toast.success('Project updated successfully')
        router.push(`/projects/${project.id}`)
        router.refresh()
      } else {
        toast.error('Failed to update project')
      }
    } catch (err) {
      toast.error('An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Project deleted')
        router.push('/projects')
        router.refresh()
      } else {
        toast.error('Failed to delete project')
        setIsDeleting(false)
      }
    } catch (err) {
      toast.error('An error occurred during deletion')
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <SectionHeader
        title="Edit Project"
        description={`Configuration for: ${project.name}`}
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
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="space-y-6">
                <Input
                  label="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Agency OS Web Application"
                  required
                  inputSize="lg"
                  leftIcon={<Briefcase className="w-5 h-5" />}
                />

                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the project goals and context..."
                  className="min-h-[150px]"
                />

                <div className="max-w-xs space-y-2">
                   <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                   <Combobox 
                    items={statusOptions}
                    value={status}
                    onChange={setStatus}
                    placeholder="Select status"
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
                    Update Project
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

