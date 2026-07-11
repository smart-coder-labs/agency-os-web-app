"use client"

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Combobox } from '@/shared/components/ui/Combobox'
import { toast } from 'sonner'
import { updateStory, type FormState } from '@/app/(admin)/user-stories/_actions/user_story-actions'

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'READY', label: 'Ready' },
  { value: 'DONE', label: 'Done' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      loading={pending}
      disabled={pending}
      leftIcon={!pending ? <Save className="w-4 h-4" /> : undefined}
    >
      Save Changes
    </Button>
  )
}

export default function EditUserStoryForm({ story }: { story: any }) {
  const router = useRouter()
  const initialState: FormState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(updateStory, initialState)
  const [status, setStatus] = useState(story.status || 'PENDING')

  useEffect(() => {
    if (state.message) toast.error(state.message)
  }, [state.message])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <SectionHeader
        title="Edit User Story"
        description={`Update: ${story.title}`}
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

      <Card>
        <CardContent className="pt-6">
          <form action={dispatch} className="space-y-6">
            <input type="hidden" name="id" value={story.id} />
            <input type="hidden" name="project_id" value={story.project_id} />

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="As a (Role)"
                    name="role"
                    defaultValue={story.role ?? ''}
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
                defaultValue={story.goal ?? ''}
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
                defaultValue={story.benefit ?? ''}
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
                defaultValue={story.title ?? ''}
                required
                placeholder="Short summary for the board"
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

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
                <SubmitButton />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
