'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { createProject, type FormState } from '@/app/(admin)/projects/_actions/project-actions'

export default function NewProjectPage() {
  const initialState: FormState = { message: null, errors: {} }
  const [state, dispatch] = useFormState(createProject, initialState)

  // NOTE: The success modal and redirection are now handled by the server action itself.
  // This simplifies the client-side code significantly.

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Link href="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
      </Link>

      <SectionHeader 
        title="Create New Project" 
        description="Initialize a new project within Agency OS."
      />

      <Card>
        <CardContent className="pt-6">
          <form action={dispatch} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div>
                <Input 
                  label="Project Name" 
                  name="name"
                  required 
                  placeholder="e.g. My Awesome App"
                  aria-describedby="name-error"
                />
                <div id="name-error" aria-live="polite" aria-atomic="true">
                  {state.errors?.name && state.errors.name.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>
             <div>
                <Textarea 
                  label="Description" 
                  name="description"
                  placeholder="Brief overview of the project's purpose..."
                  rows={3}
                  required
                  aria-describedby="description-error"
                />
                <div id="description-error" aria-live="polite" aria-atomic="true">
                  {state.errors?.description && state.errors.description.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Repository Settings (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Local Path" 
                  name="repo_path"
                  placeholder="/home/user/workspace/project"
                  className="font-mono text-xs"
                />
                <Input 
                  label="GitHub URL" 
                  name="github_path"
                  placeholder="https://github.com/user/project"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {state.message && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                <span className="font-bold">Error:</span> {state.message}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/projects">
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

function SubmitButton() {
  // useFormStatus is a hook that gives you the status of the form submission.
  // It must be used in a component that is a child of the form.
  const { pending } = useFormStatus()

  return (
    <Button type="submit" loading={pending} disabled={pending} leftIcon={!pending && <Save className="w-4 h-4" />}>
      Create Project
    </Button>
  )
}
