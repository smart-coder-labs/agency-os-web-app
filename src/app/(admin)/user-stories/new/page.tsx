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
import { createStory, type FormState } from '@/app/(admin)/user-stories/_actions/user_story-actions'

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'READY', label: 'Ready' },
  { value: 'DONE', label: 'Done' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} disabled={pending} leftIcon={!pending ? <Save className="w-4 h-4" /> : undefined}>
      Create Story
    </Button>
  )
}

function NewStoryForm() {
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId') ?? ''

  const initialState: FormState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(createStory, initialState)
  const [status, setStatus] = useState('PENDING')

  const backLink = projectIdParam ? `/projects/${projectIdParam}` : '/user-stories'
  const backLabel = projectIdParam ? 'Back to Project Stories' : 'Back to Stories'

  useEffect(() => {
    if (state.message) toast.error(state.message)
  }, [state.message])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Link href={backLink} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
      </Link>

      <SectionHeader
        title="Create User Story"
        description="Capture product requirements from a user perspective."
      />

      <Card>
        <CardContent className="pt-6">
          <form action={dispatch} className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="As a (Role)"
                    name="role"
                    required
                    placeholder="e.g. Admin User"
                    aria-describedby="role-error"
                  />
                  <div id="role-error" aria-live="polite">
                    {state.errors?.role?.map((e: string) => (
                      <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 block">Status</label>
                  <Combobox
                    name="status"
                    items={statusOptions}
                    value={status}
                    onChange={setStatus}
                    placeholder="Select status"
                  />
                </div>
              </div>

              <Textarea
                label="I want to (Goal/Action)"
                name="goal"
                required
                placeholder="e.g. see a list of all active projects"
                rows={3}
                aria-describedby="goal-error"
              />
              <div id="goal-error" aria-live="polite">
                {state.errors?.goal?.map((e: string) => (
                  <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                ))}
              </div>

              <Textarea
                label="So that (Benefit/Value)"
                name="benefit"
                required
                placeholder="e.g. I can track progress across the organization"
                rows={3}
                aria-describedby="benefit-error"
              />
              <div id="benefit-error" aria-live="polite">
                {state.errors?.benefit?.map((e: string) => (
                  <p key={e} className="mt-1 text-sm text-red-500">{e}</p>
                ))}
              </div>

              <Input
                label="Story Title (Summary)"
                name="title"
                required
                placeholder="Short summary for the board"
                helperText="Short summary for the board"
                aria-describedby="title-error"
              />
              <div id="title-error" aria-live="polite">
                {state.errors?.title?.map((e: string) => (
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

export default function NewStoryPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NewStoryForm />
    </Suspense>
  )
}
