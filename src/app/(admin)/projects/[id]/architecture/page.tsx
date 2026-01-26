"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Markdown } from '@/components/ui/Markdown'
import { Card, CardContent } from '@/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw, Cpu, Code2, Plus, Trash2, FileCode } from 'lucide-react'
import { use } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

interface Diagram {
  name: string;
  code: string;
  type: 'mermaid' | 'other';
}

export default function ArchitectureSpecsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params)
  const router = useRouter()
  const [content, setContent] = useState('')
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [stackDecisions, setStackDecisions] = useState('{}')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('write')

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/architecture-specs/${projectId}`)
      if (r.ok) {
        const b = await r.json()
        setContent(b.content || '')
        
        // Handle migration from old formats to the required { name, code, type } format
        const rawDiagrams = b.diagrams ?? []
        const formattedDiagrams = rawDiagrams.map((d: any) => {
          if (typeof d === 'string') return { name: 'Untitled Diagram', code: d, type: 'mermaid' }
          // Handle { name, content } -> { name, code, type }
          return { 
            name: d.name || 'Untitled Diagram', 
            code: d.code || d.content || '', 
            type: d.type || 'mermaid' 
          }
        })
        setDiagrams(formattedDiagrams)
        
        setStackDecisions(JSON.stringify(b.stack_decisions ?? {}, null, 2))
      }
    } catch (error) {
       console.error("Failed to load architecture specs", error)
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const addDiagram = () => {
    setDiagrams([...diagrams, { name: '', code: '', type: 'mermaid' }])
  }

  const removeDiagram = (index: number) => {
    setDiagrams(diagrams.filter((_, i) => i !== index))
  }

  const updateDiagram = (index: number, field: keyof Diagram, value: string) => {
    const newDiagrams = [...diagrams]
    newDiagrams[index] = { ...newDiagrams[index], [field]: value }
    setDiagrams(newDiagrams)
  }

  async function onSave() {
    setSaving(true)
    try {
        let parsedStack = {}
        try { parsedStack = JSON.parse(stackDecisions || '{}') } catch(e) { throw new Error('Invalid Stack Decisions JSON') }

        const res = await fetch(`/api/architecture-specs/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content, 
                diagrams, 
                stack_decisions: parsedStack
            })
        })
        if (!res.ok) throw new Error('Failed to save')
        router.push(`/projects/${projectId}`)
    } catch (error: any) {
        alert(error.message || 'Failed to save changes')
    } finally {
        setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <SectionHeader 
        title="Architecture Specifications" 
        description="Design the system architecture, diagrams, and tech stack decisions."
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
                <TabsTrigger value="write" className="flex items-center gap-2" disabled={loading}>
                    <Edit2 className="w-4 h-4" /> Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2" disabled={loading}>
                    <Eye className="w-4 h-4" /> Preview
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="write" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
                {/* System Design Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-4 h-4" /> System Design (Markdown)
                  </h3>
                  <Card>
                      <CardContent className="pt-6">
                          {loading ? (
                            <Skeleton className="h-[500px] w-full" />
                          ) : (
                            <Textarea 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                className="font-mono text-sm min-h-[500px]"
                                placeholder="# System Overview..."
                            />
                          )}
                      </CardContent>
                  </Card>
                </div>

                {/* Diagrams Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Architecture Diagrams
                    </h3>
                    <Button variant="secondary" size="sm" onClick={addDiagram} disabled={loading} leftIcon={<Plus className="w-4 h-4" />}>
                      Add Diagram
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                      [1, 2].map(i => (
                        <Card key={i}>
                          <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-[150px] w-full" />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <>
                        {diagrams.map((diag, idx) => (
                          <Card key={idx} className="relative group overflow-hidden">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="sm" className="h-8 w-8 p-0 text-red-500 border-red-100 hover:bg-red-50" onClick={() => removeDiagram(idx)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <CardContent className="pt-6 space-y-4">
                              <Input 
                                label="Diagram Name" 
                                value={diag.name} 
                                onChange={(e) => updateDiagram(idx, 'name', e.target.value)}
                                placeholder="e.g. System Overview, Database Schema..."
                              />
                              <Textarea 
                                label="Mermaid Code" 
                                value={diag.code} 
                                onChange={(e) => updateDiagram(idx, 'code', e.target.value)}
                                className="font-mono text-sm min-h-[150px]"
                                placeholder="graph TD\n  A --> B"
                              />
                            </CardContent>
                          </Card>
                        ))}
                        {diagrams.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30 text-gray-400 text-sm">
                            No diagrams added yet. Click "Add Diagram" to start.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Stack Decisions Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4" /> Stack Decisions (JSON Object)
                    </h3>
                    <Card>
                        <CardContent className="pt-6">
                            {loading ? (
                              <Skeleton className="h-[200px] w-full" />
                            ) : (
                              <Textarea 
                                  value={stackDecisions} 
                                  onChange={(e) => setStackDecisions(e.target.value)} 
                                  className="font-mono text-sm min-h-[200px]"
                                  placeholder='{ "backend": "FastAPI" }'
                              />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="preview">
            <Card className="min-h-[500px]">
                <CardContent className="pt-8 px-8 space-y-8">
                    {content || diagrams.length > 0 ? (
                        <div className="space-y-10">
                            {content && <Markdown>{content}</Markdown>}
                            
                            {/* Diagrams Section */}
                            {diagrams.length > 0 && (
                                <div className="pt-8 border-t border-gray-100">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-blue-500" /> Architecture Diagrams
                                    </h3>
                                    <div className="space-y-8">
                                        {diagrams.map((diag, i) => (
                                            <div key={i} className="space-y-4">
                                                {diag.name && <h4 className="font-semibold text-gray-700">{diag.name}</h4>}
                                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 overflow-hidden">
                                                    <Markdown>{` \`\`\`mermaid\n${diag.code}\n\`\`\` `}</Markdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stack Decisions */}
                            {(() => {
                                try {
                                    const s = JSON.parse(stackDecisions)
                                    if (Object.keys(s).length > 0) {
                                        return (
                                            <div className="pt-8 border-t border-gray-100">
                                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                                    <Code2 className="w-5 h-5 text-purple-500" /> Tech Stack Decisions
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {Object.entries(s).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none block mb-1">{key}</span>
                                                            <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                } catch (e) {}
                                return null
                            })()}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No content yet. Switch to "Write" tab to design the architecture.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
