"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalCloseButton } from '@/shared/components/ui/Modal'
import { Combobox } from '@/shared/components/ui/Combobox'
import { ArrowLeft, Save, CheckCircle2, Plus, List } from 'lucide-react'
import Link from 'next/link'

function NewTaskForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get projectId from URL if present
    const projectIdParam = searchParams.get('projectId')
    const [projectId, setProjectId] = useState(projectIdParam || '')

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('feature')
    const [priority, setPriority] = useState('2') // Medium default
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    
    const [projects, setProjects] = useState<{value: string, label: string}[]>([])
    
    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    
    // Sync state if URL param changes
    useEffect(() => {
        if(projectIdParam) setProjectId(projectIdParam)
    }, [projectIdParam])

    // Fetch projects for the selector
    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects')
                if (res.ok) {
                    const data = await res.json()
                    setProjects(data.map((p: any) => ({ value: String(p.id), label: p.name })))
                }
            } catch (e) {
                console.error("Failed to fetch projects", e)
            }
        }
        fetchProjects()
    }, [])

    async function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      setError(null)

      if (!projectId) {
          setError('Project is required')
          return
      }

      setLoading(true)
  
      try {
          const res = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  project_id: projectId,
                  title, 
                  description, 
                  type,
                  priority: parseInt(priority),
                  status: 'TODO'
              })
          })
          
          if (res.ok) {
              await res.json()
              setShowSuccessModal(true)
          } else {
              const j = await res.json().catch(() => ({}))
              setError(j.error || 'Failed to create task')
          }
      } catch (err) {
          setError('An unexpected error occurred')
      } finally {
          setLoading(false)
      }
    }
  
    const handleReset = () => {
      setTitle('')
      setDescription('')
      // We keep projectId if it was there or selected
      setType('feature')
      setPriority('2')
      setError(null)
      setShowSuccessModal(false)
    }

    const backLink = projectIdParam ? `/projects/${projectIdParam}` : '/tasks'; // Prefer returning to the specific project view if we came from there
    const backLabel = projectIdParam ? 'Back to Project' : 'Back to Tasks';
    const listLink = projectId ? `/projects/${projectId}?tab=tasks` : '/tasks';

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
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 block">Project <span className="text-red-500 text-xs">*</span></label>
                            <Combobox 
                                items={projects}
                                value={projectId}
                                onChange={setProjectId}
                                placeholder="Select a project..."
                                searchPlaceholder="Search projects..."
                                emptyMessage="No projects found."
                            />
                         </div>

                         <Input 
                            label="Task Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                            placeholder="e.g. Implement Authorization Middleware"
                            autoFocus
                         />
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 block">Type</label>
                                <select 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                >
                                    <option value="feature">Feature</option>
                                    <option value="bug">Bug</option>
                                    <option value="chore">Chore</option>
                                    <option value="refactor">Refactor</option>
                                    <option value="design">Design</option>
                                </select>
                            </div>
    
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 block">Priority</label>
                                <select 
                                    value={priority} 
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                >
                                    <option value="1">Low</option>
                                    <option value="2">Medium</option>
                                    <option value="3">High</option>
                                    <option value="4">Urgent</option>
                                </select>
                            </div>
                         </div>

    
                         <Textarea 
                            label="Description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Detailed explanation of what needs to be done..."
                            rows={6}
                            required
                         />
                    </div>
    
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                             <span className="font-bold">Error:</span> {error}
                        </div>
                    )}
    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link href={backLink}>
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button type="submit" loading={loading} leftIcon={!loading && <Save className="w-4 h-4" />}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </CardContent>
          </Card>
    
          <Modal open={showSuccessModal} onOpenChange={setShowSuccessModal} position="center">
             <ModalCloseButton />
             <ModalHeader className="text-center pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <ModalTitle>Task Created Successfully!</ModalTitle>
                <ModalDescription className="max-w-xs mx-auto">
                    Task &quot;{title}&quot; has been added to the backlog.
                </ModalDescription>
             </ModalHeader>
             
             <div className="flex flex-col gap-3 p-4 pt-0">
                 <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={handleReset} 
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Create Another
                    </Button>
                    <Link href={listLink} className="block w-full">
                         <Button 
                            variant="outline" 
                            fullWidth 
                            leftIcon={<List className="w-4 h-4" />}
                         >
                            Back to List
                        </Button>
                    </Link>
                 </div>
             </div>
          </Modal>
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
