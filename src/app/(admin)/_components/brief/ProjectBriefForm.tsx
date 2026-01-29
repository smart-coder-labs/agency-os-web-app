'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Markdown } from '@/shared/components/ui/Markdown'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { toast } from 'sonner'

interface ProjectBriefFormProps {
  projectId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProjectBriefForm({ projectId, onCancel, onSuccess }: ProjectBriefFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [goals, setGoals] = useState('[]')
  const [targetAudience, setTargetAudience] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('write')

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/project-briefs/${projectId}`)
      if (r.ok) {
        const b = await r.json()
        setContent(b.content || '')
        setGoals(JSON.stringify(b.goals ?? [], null, 2))
        setTargetAudience(b.target_audience || '')
      }
    } catch (error) {
       console.error("Failed to load brief", error)
       toast.error("Failed to load brief")
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const getParsedGoals = () => {
    try {
      const parsed = JSON.parse(goals)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  async function onSave() {
    setSaving(true)
    try {
        const res = await fetch(`/api/project-briefs/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content, 
                goals: JSON.parse(goals || '[]'), 
                target_audience: targetAudience 
            })
        })
        if (!res.ok) throw new Error('Failed to save')
        
        toast.success("Brief updated successfully")
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/projects/${projectId}`)
          router.refresh()
        }
    } catch (error) {
        toast.error('Failed to save changes')
    } finally {
        setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 sticky top-0 z-10 shadow-sm">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-gray-100/50">
                    <TabsTrigger value="write" className="flex items-center gap-2" disabled={loading}>
                        <Edit2 className="w-4 h-4" /> Write
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2" disabled={loading}>
                        <Eye className="w-4 h-4" /> Preview
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
                {onCancel && (
                    <Button variant="ghost" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                )}
                <Button 
                    variant="secondary" 
                    onClick={loadData} 
                    disabled={loading || saving}
                    size="sm"
                    leftIcon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
                >
                    Reset
                </Button>
                <Button 
                    onClick={onSave} 
                    disabled={loading || saving}
                    size="sm"
                    leftIcon={saving ? <Loader2 className="animate-spin w-3 h-3"/> : <Save className="w-3 h-3" />}
                >
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="write" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-6">
                <Card className="border-border-primary/50 shadow-sm">
                    <CardContent className="pt-6">
                        {loading ? (
                          <Skeleton className="h-[400px] w-full" />
                        ) : (
                          <Textarea 
                              label="Content (Markdown)" 
                              value={content} 
                              onChange={(e) => setContent(e.target.value)} 
                              className="font-mono text-sm min-h-[400px] bg-gray-50/30 focus:bg-white transition-colors"
                              placeholder="# Project Overview..."
                          />
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border-primary/50 shadow-sm">
                        <CardContent className="pt-6">
                            {loading ? (
                            <Skeleton className="h-10 w-full mb-2" />
                            ) : (
                            <Input 
                                label="Target Audience" 
                                value={targetAudience} 
                                onChange={(e) => setTargetAudience(e.target.value)} 
                                placeholder="e.g. Small business owners..."
                            />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border-primary/50 shadow-sm">
                        <CardContent className="pt-6">
                            {loading ? (
                            <Skeleton className="h-32 w-full" />
                            ) : (
                            <Textarea 
                                label="Goals (JSON Array)" 
                                value={goals} 
                                onChange={(e) => setGoals(e.target.value)} 
                                className="font-mono text-sm min-h-[100px] bg-gray-50/30 focus:bg-white transition-colors"
                                placeholder='["Goal 1", "Goal 2"]'
                            />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="preview" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="min-h-[500px] border-border-primary/50 shadow-sm overflow-hidden bg-white">
                <CardContent className="pt-8 px-8 space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 pb-8">
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Audience</h3>
                            <p className="text-lg text-gray-900 font-medium">{targetAudience || 'Not specified'}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Goals</h3>
                            <ul className="space-y-2">
                                {getParsedGoals().map((goal: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        {goal}
                                    </li>
                                ))}
                                {getParsedGoals().length === 0 && <span className="text-gray-400 italic text-sm">No goals defined</span>}
                            </ul>
                        </div>
                    </div>

                    {/* Markdown Content */}
                    <div className="prose prose-slate max-w-none">
                         {content ? (
                            <Markdown>{content}</Markdown>
                         ) : (
                            <div className="text-center py-12 text-gray-400 italic">
                                No content yet. Switch to "Write" tab to add project details.
                            </div>
                         )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
