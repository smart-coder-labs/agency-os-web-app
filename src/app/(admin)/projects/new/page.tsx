"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton } from '@/components/ui/Modal'
import { ArrowLeft, Save, CheckCircle2, Eye, Plus, List } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const [githubPath, setGithubPath] = useState('')
  const [status, setStatus] = useState('DISCOVERY')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                description, 
                status, 
                repo_path: repoPath,
                github_path: githubPath
            })
        })
        
        if (res.ok) {
            const j = await res.json()
            setCreatedProjectId(j.id)
            setShowSuccessModal(true)
        } else {
            const j = await res.json().catch(() => ({}))
            setError(j.error || 'Failed to create project')
        }
    } catch (err) {
        setError('An unexpected error occurred')
    } finally {
        setLoading(false)
    }
  }

  const handleReset = () => {
    setName('')
    setDescription('')
    setRepoPath('')
    setGithubPath('')
    setStatus('DISCOVERY')
    setCreatedProjectId(null)
    setError(null)
    setShowSuccessModal(false)
  }

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
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                     <Input 
                        label="Project Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        placeholder="e.g. My Awesome App"
                     />
                     <Textarea 
                        label="Description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Brief overview of the project's purpose..."
                        rows={3}
                     />
                     <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 block">Status</label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out"
                        >
                            <option value="DISCOVERY">Discovery</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="PAUSED">Paused</option>
                            <option value="DONE">Done</option>
                        </select>
                     </div>
                </div>

                <div className="space-y-4 pt-4">
                     <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Repository Settings</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Local Path" 
                            value={repoPath} 
                            onChange={(e) => setRepoPath(e.target.value)} 
                            placeholder="/home/user/workspace/project"
                            className="font-mono text-xs"
                        />
                        <Input 
                            label="GitHub URL" 
                            value={githubPath} 
                            onChange={(e) => setGithubPath(e.target.value)} 
                            placeholder="https://github.com/user/project"
                            className="font-mono text-xs"
                        />
                     </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                         <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link href="/projects">
                        <Button type="button" variant="ghost">Cancel</Button>
                    </Link>
                    <Button type="submit" loading={loading} leftIcon={!loading && <Save className="w-4 h-4" />}>
                        Create Project
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
            <ModalTitle>Project Created Successfully!</ModalTitle>
            <ModalDescription className="max-w-xs mx-auto">
                "{name}" has been initialized in the system.
            </ModalDescription>
         </ModalHeader>
         <ModalContent className="flex flex-col gap-3">
             <Link href={`/projects/${createdProjectId}`} className="w-full">
                <Button fullWidth size="lg" leftIcon={<Eye className="w-4 h-4" />}>
                    View Project
                </Button>
             </Link>
             <div className="grid grid-cols-2 gap-3">
                <Button 
                    variant="secondary" 
                    onClick={handleReset} 
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    Create Another
                </Button>
                <Link href="/projects" className="block w-full">
                     <Button 
                        variant="outline" 
                        fullWidth 
                        leftIcon={<List className="w-4 h-4" />}
                     >
                        Back to List
                    </Button>
                </Link>
             </div>
         </ModalContent>
      </Modal>
    </div>
  )
}
