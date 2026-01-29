'use client'

import { useFormStatus } from 'react-dom'
import { Save, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { createProject, updateProject, deleteProject, type FormState } from '@/app/(admin)/projects/_actions/project-actions'
import { useActionState, useState } from 'react'
import { Combobox } from '@/shared/components/ui/Combobox'
import { toast } from 'sonner'

interface ProjectFormProps {
  project?: any;
  onCancel?: () => void;
}

export function ProjectForm({ project, onCancel }: ProjectFormProps) {
  const isEdit = !!project
  const initialState: FormState = { message: null, errors: {} }
  const action = isEdit ? updateProject : createProject
  const [state, dispatch] = useActionState(action, initialState)
  
  const [status, setStatus] = useState(project?.status || 'DISCOVERY')

  const statusOptions = [
    { value: 'DISCOVERY', label: 'Discovery' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'DONE', label: 'Done' },
  ]

  return (
    <div className="space-y-6">
      <form action={dispatch} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={project.id} />}
        
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          <div>
            <Input 
              label="Project Name" 
              name="name"
              defaultValue={project?.name}
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
              defaultValue={project?.description}
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

          {isEdit && (
            <div className="max-w-xs space-y-2">
              <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
              <Combobox 
                name="status"
                items={statusOptions}
                value={status}
                onChange={setStatus}
                placeholder="Select status"
              />
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Repository Settings (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Local Path" 
              name="repo_path"
              defaultValue={project?.repo_path}
              placeholder="/home/user/workspace/project"
              className="font-mono text-xs"
            />
            <Input 
              label="GitHub URL" 
              name="github_path"
              defaultValue={project?.github_path}
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

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            )}
            <SubmitButton isEdit={isEdit} />
          </div>
        </div>
      </form>
    </div>
  )
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" loading={pending} disabled={pending} leftIcon={!pending && <Save className="w-4 h-4" />}>
      {isEdit ? 'Update Project' : 'Create Project'}
    </Button>
  )
}
