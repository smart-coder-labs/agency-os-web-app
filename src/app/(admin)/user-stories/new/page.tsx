"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalCloseButton } from '@/components/ui/Modal'
import { Combobox } from '@/components/ui/Combobox'
import { ArrowLeft, Save, CheckCircle2, Plus, List, BookOpen } from 'lucide-react'
import Link from 'next/link'

function NewStoryForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get projectId from URL if present
    const projectIdParam = searchParams.get('projectId')
    const [projectId, setProjectId] = useState(projectIdParam || '')

    const [title, setTitle] = useState('')
    const [role, setRole] = useState('')
    const [goal, setGoal] = useState('')
    const [benefit, setBenefit] = useState('')
    const [priority, setPriority] = useState('2') // Medium default - though schema might not have it, let's check. 
    // Schema in original file didn't have priority, but API might ignore it. 
    // The original file only had title, role, goal, benefit, status.
    // I will stick to those.
    
    const [status, setStatus] = useState('PENDING')
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
          const res = await fetch('/api/user-stories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  project_id: projectId,
                  title,
                  role,
                  goal,
                  benefit,
                  status
              })
          })
          
          if (res.ok) {
              await res.json()
              setShowSuccessModal(true)
          } else {
              const j = await res.json().catch(() => ({}))
              setError(j.error || 'Failed to create story')
          }
      } catch (err) {
          setError('An unexpected error occurred')
      } finally {
          setLoading(false)
      }
    }
  
    const handleReset = () => {
      setTitle('')
      setRole('')
      setGoal('')
      setBenefit('')
      setStatus('PENDING')
      setShowSuccessModal(false)
      setError(null)
    }

    const backLink = projectIdParam ? `/projects/${projectIdParam}?tab=stories` : '/user-stories'; // Prefer returning to the specific project view if we came from there
    const backLabel = projectIdParam ? 'Back to Project Stories' : 'Back to Stories';
    const listLink = projectId ? `/projects/${projectId}?tab=stories` : '/user-stories';

    // Auto-generate title if empty from components
    const generateTitle = () => {
        if (!title && role && goal) {
            setTitle(`${role} - ${goal.substring(0, 30)}${goal.length > 30 ? '...' : ''}`)
        }
    }

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

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="As a (Role)" 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)} 
                                required 
                                placeholder="e.g. Admin User"
                                onBlur={generateTitle}
                            />
                            
                             <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 block">Status</label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="READY">Ready</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </div>
                         </div>

                         <Textarea 
                            label="I want to (Goal/Action)" 
                            value={goal} 
                            onChange={(e) => setGoal(e.target.value)} 
                            required 
                            placeholder="e.g. see a list of all active projects"
                            rows={3}
                            onBlur={generateTitle}
                         />

                        <Textarea 
                            label="So that (Benefit/Value)" 
                            value={benefit} 
                            onChange={(e) => setBenefit(e.target.value)} 
                            required 
                            placeholder="e.g. I can track progress across the organization"
                            rows={3}
                         />

                         <div className="pt-2">
                             <Input 
                                label="Story Title (Summary)" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                                placeholder="Auto-generated or custom title"
                                helperText="Short summary for the board"
                             />
                         </div>
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
                            Create Story
                        </Button>
                    </div>
                </form>
            </CardContent>
          </Card>
    
          <Modal open={showSuccessModal} onOpenChange={setShowSuccessModal} position="center">
             <ModalCloseButton />
             <ModalHeader className="text-center pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <ModalTitle>Story Created!</ModalTitle>
                <ModalDescription className="max-w-xs mx-auto">
                    User story "{title}" has been saved.
                </ModalDescription>
             </ModalHeader>
             
             <div className="flex flex-col gap-3 p-4 pt-0">
                 <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={handleReset} 
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add Another
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

export default function NewStoryPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <NewStoryForm />
        </Suspense>
    )
}
