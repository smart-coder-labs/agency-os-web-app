'use client'

import { useFormStatus } from 'react-dom'
import { Save } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { createProject, type FormState } from '@/app/(admin)/projects/_actions/project-actions'
import { useActionState } from 'react'

interface ProjectFormProps {
  onCancel?: () => void;
}

export function ProjectForm({ onCancel }: ProjectFormProps) {
  const initialState: FormState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(createProject, initialState)

  return (
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
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
        <SubmitButton />
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" loading={pending} disabled={pending} leftIcon={!pending && <Save className="w-4 h-4" />}>
      Create Project
    </Button>
  )
}
