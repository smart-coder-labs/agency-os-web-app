"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Markdown } from '@/components/ui/Markdown'
import { Card, CardContent } from '@/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw } from 'lucide-react'

export default function ProjectBriefPage({ params }: { params: { id: string } }) {
  const projectId = params.id
  const router = useRouter()
  const [content, setContent] = useState('')
  const [goals, setGoals] = useState('[]')
  const [targetAudience, setTargetAudience] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('write')

  // Helper to safely parse goals
  const getParsedGoals = () => {
    try {
      const parsed = JSON.parse(goals)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

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
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId])

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
        router.refresh()
        // Optional: Show success toast here
    } catch (error) {
        alert('Failed to save changes')
    } finally {
        setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <SectionHeader 
        title="Project Brief" 
        description="Define strategies, goals, and target audience."
        actions={
            <div className="flex items-center gap-2">
                <Button 
                    variant="secondary" 
                    onClick={loadData} 
                    disabled={loading || saving}
                    leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                >
                    Reset
                </Button>
                <Button 
                    onClick={onSave} 
                    disabled={loading || saving}
                    leftIcon={saving ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4" />}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
            <TabsList>
                <TabsTrigger value="write" className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Preview
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="write" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="md:col-span-2">
                    <CardContent className="pt-6">
                        <Textarea 
                            label="Content (Markdown)" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            className="font-mono text-sm min-h-[400px]"
                            placeholder="# Project Overview..."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Input 
                            label="Target Audience" 
                            value={targetAudience} 
                            onChange={(e) => setTargetAudience(e.target.value)} 
                            placeholder="e.g. Small business owners..."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Textarea 
                            label="Goals (JSON Array)" 
                            value={goals} 
                            onChange={(e) => setGoals(e.target.value)} 
                            className="font-mono text-sm min-h-[100px]"
                            placeholder='["Goal 1", "Goal 2"]'
                        />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="preview">
            <Card className="min-h-[500px]">
                <CardContent className="pt-8 px-8 space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 pb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Audience</h3>
                            <p className="text-lg text-gray-900">{targetAudience || 'Not specified'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Goals</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {getParsedGoals().map((goal: string, idx: number) => (
                                    <li key={idx}>{goal}</li>
                                ))}
                                {getParsedGoals().length === 0 && <span className="text-gray-400 italic">No goals defined</span>}
                            </ul>
                        </div>
                    </div>

                    {/* Markdown Content */}
                    <div>
                         {content ? (
                            <Markdown>{content}</Markdown>
                         ) : (
                            <div className="text-center py-12 text-gray-400">
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
