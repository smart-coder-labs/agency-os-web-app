"use client"

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'
import { Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Combobox } from '@/shared/components/ui/Combobox'
import { toast } from 'sonner'
import { updateTask, type FormState } from '@/app/(admin)/tasks/_actions/task-actions'
import { useRouter } from 'next/navigation'

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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      loading={pending}
      disabled={pending}
      leftIcon={!pending ? <Save className="w-4 h-4" /> : undefined}
      fullWidth
      className="sm:w-48"
    >
      Save Changes
    </Button>
  )
}

export default function EditTaskForm({ task }: { task: any }) {
  const router = useRouter()
  const initialState: FormState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(updateTask, initialState)
  const [type, setType] = useState(task.type || 'GENERAL')
  const [status, setStatus] = useState(task.status || 'TODO')

  useEffect(() => {
    if (state.message) toast.error(state.message)
  }, [state.message])

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
            <form action={dispatch} className="space-y-8">
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="project_id" value={task.project_id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <Input
                    label="Task Title"
                    name="title"
                    defaultValue={task.title}
                    placeholder="E.g., Implement authentication flow"
                    required
                    inputSize="lg"
                    aria-describedby="title-error"
                  />
                  <div id="title-error" aria-live="polite">
                    {state.errors?.title?.map((e: string) => (
                      <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    name="description"
                    defaultValue={task.description ?? ''}
                    placeholder="Describe what needs to be done..."
                    className="min-h-[120px]"
                    aria-describedby="description-error"
                  />
                  <div id="description-error" aria-live="polite">
                    {state.errors?.description?.map((e: string) => (
                      <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
                  <Combobox
                    name="type"
                    items={typeOptions}
                    value={type}
                    onChange={setType}
                    placeholder="Select type"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                  <Combobox
                    name="status"
                    items={statusOptions}
                    value={status}
                    onChange={setStatus}
                    placeholder="Select status"
                  />
                </div>

                <div>
                  <Input
                    label="Priority"
                    name="priority"
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={task.priority ?? 1}
                    helperText="1 (Low) to 5 (Urgent)"
                  />
                </div>
              </div>

              {state.message && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                  <span className="font-bold">Error:</span> {state.message}
                </div>
              )}

              <div className="pt-8 border-t border-border-primary/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <SubmitButton />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
