"use client"

import { useEffect, useState, Suspense } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Combobox } from '@/shared/components/ui/Combobox'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createTask, type FormState } from '@/app/(admin)/tasks/_actions/task-actions'

const typeOptions = [
  { value: 'GENERAL', label: 'General' },
  { value: 'BUG', label: 'Bug' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'RESEARCH', label: 'Research' },
]

const priorityOptions = [
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
  { value: '4', label: 'Urgent' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} disabled={pending} leftIcon={!pending ? <Save className="w-4 h-4" /> : undefined}>
      Create Task
    </Button>
  )
}

function NewTaskForm() {
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId') ?? ''

  const initialState: FormState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(createTask, initialState)
  const [type, setType] = useState('GENERAL')
  const [priority, setPriority] = useState('2')

  const backLink = projectIdParam ? `/projects/${projectIdParam}` : '/tasks'
  const backLabel = projectIdParam ? 'Back to Project' : 'Back to Tasks'

  useEffect(() => {
    if (state.message) toast.error(state.message)
  }, [state.message])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Link href={backLink} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
      </Link>

      <SectionHeader
        title="Create New Task"
        description="Define a unit of work for your agents or team."
      />

      <Card>
        <CardContent className="pt-6">
          <form action={dispatch} className="space-y-6">
            <input type="hidden" name="status" value="TODO" />
            {projectIdParam && <input type="hidden" name="project_id" value={projectIdParam} />}

            <div className="space-y-4">
              {!projectIdParam && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 block">
                    Project ID <span className="text-red-500 text-xs">*</span>
                  </label>
                  <Input
                    name="project_id"
                    placeholder="Enter project UUID"
                    required
                    aria-describedby="project_id-error"
                  />
                  <div id="project_id-error" aria-live="polite">
                    {state.errors?.project_id?.map((e: string) => (
                      <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Task Title"
                name="title"
                required
                placeholder="e.g. Implement Authorization Middleware"
                autoFocus
                aria-describedby="title-error"
              />
              <div id="title-error" aria-live="polite">
                {state.errors?.title?.map((e: string) => (
                  <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 block">Type</label>
                  <Combobox
                    name="type"
                    items={typeOptions}
                    value={type}
                    onChange={setType}
                    placeholder="Select type"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 block">Priority</label>
                  <Combobox
                    name="priority"
                    items={priorityOptions}
                    value={priority}
                    onChange={setPriority}
                    placeholder="Select priority"
                  />
                </div>
              </div>

              <Textarea
                label="Description"
                name="description"
                placeholder="Detailed explanation of what needs to be done..."
                rows={6}
                aria-describedby="description-error"
              />
              <div id="description-error" aria-live="polite">
                {state.errors?.description?.map((e: string) => (
                  <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                ))}
              </div>
            </div>

            {state.message && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                <span className="font-bold">Error:</span> {state.message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Link href={backLink}>
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NewTaskForm />
    </Suspense>
  )
}
