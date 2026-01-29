'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/Button'
import { Input, Textarea } from '@/shared/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Markdown } from '@/shared/components/ui/Markdown'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw, Cpu, Code2, Plus, Trash2, FileCode } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { toast } from 'sonner'

interface Diagram {
  name: string;
  code: string;
  type: 'mermaid' | 'other';
}

interface ArchitectureSpecsFormProps {
  projectId: string;
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ArchitectureSpecsForm({ projectId, initialData, onCancel, onSuccess }: ArchitectureSpecsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(!initialData)
  
  const [content, setContent] = useState(initialData?.content || '')
  const [diagrams, setDiagrams] = useState<Diagram[]>(() => {
    const raw = initialData?.diagrams ?? []
    return raw.map((d: any) => {
      if (typeof d === 'string') return { name: 'Untitled Diagram', code: d, type: 'mermaid' }
      return { 
        name: d.name || 'Untitled Diagram', 
        code: d.code || d.content || '', 
        type: d.type || 'mermaid' 
      }
    })
  })
  const [stackDecisions, setStackDecisions] = useState(JSON.stringify(initialData?.stack_decisions ?? {}, null, 2))
  const [activeTab, setActiveTab] = useState('write')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/architecture-specs/${projectId}`)
      if (r.ok) {
        const b = await r.json()
        setContent(b.content || '')
        
        const rawDiagrams = b.diagrams ?? []
        const formattedDiagrams = rawDiagrams.map((d: any) => {
          if (typeof d === 'string') return { name: 'Untitled Diagram', code: d, type: 'mermaid' }
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
       toast.error("Failed to load architecture specs")
    } finally {
       setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!initialData) {
      loadData()
    }
  }, [initialData, loadData])

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
    startTransition(async () => {
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
          
          toast.success("Architecture specs updated successfully")
          
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(`/projects/${projectId}`)
            router.refresh()
          }
      } catch (error: any) {
          toast.error(error.message || 'Failed to save changes')
      }
    })
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
                    <Button variant="ghost" onClick={onCancel} disabled={isPending || loading} size="sm">
                        Cancel
                    </Button>
                )}
                <Button 
                    variant="secondary" 
                    onClick={loadData} 
                    disabled={isPending || loading}
                    size="sm"
                    leftIcon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
                >
                    Reset
                </Button>
                <Button 
                    onClick={onSave} 
                    disabled={isPending || loading}
                    size="sm"
                    leftIcon={isPending ? <Loader2 className="animate-spin w-3 h-3"/> : <Save className="w-3 h-3" />}
                >
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="write" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 gap-8">
                {/* System Design Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileCode className="w-3 h-3 text-accent-blue" /> System Design (Markdown)
                  </h3>
                  <Card className="border-border-primary/50 shadow-sm">
                      <CardContent className="pt-6">
                          {loading ? (
                            <Skeleton className="h-[500px] w-full" />
                          ) : (
                            <Textarea 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                className="font-mono text-sm min-h-[500px] bg-gray-50/30 focus:bg-white transition-colors"
                                placeholder="# System Overview..."
                            />
                          )}
                      </CardContent>
                  </Card>
                </div>

                {/* Diagrams Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-3 h-3 text-purple-500" /> Architecture Diagrams
                    </h3>
                    <Button variant="secondary" size="sm" onClick={addDiagram} disabled={loading} leftIcon={<Plus className="w-3 h-3" />}>
                      Add Diagram
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                      [1, 2].map(i => (
                        <Card key={i} className="border-border-primary/50 shadow-sm">
                          <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-[150px] w-full" />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <>
                        {diagrams.map((diag, idx) => (
                          <Card key={idx} className="relative group overflow-hidden border-border-primary/50 shadow-sm">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                                className="bg-white"
                              />
                              <Textarea 
                                label="Mermaid Code" 
                                value={diag.code} 
                                onChange={(e) => updateDiagram(idx, 'code', e.target.value)}
                                className="font-mono text-sm min-h-[150px] bg-gray-50/30 focus:bg-white transition-colors"
                                placeholder="graph TD\n  A --> B"
                              />
                            </CardContent>
                          </Card>
                        ))}
                        {diagrams.length === 0 && (
                          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/30 text-gray-400 text-sm">
                            No diagrams added yet. Click &quot;Add Diagram&quot; to start designing.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Stack Decisions Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Code2 className="w-3 h-3 text-orange-500" /> Stack Decisions (JSON Object)
                    </h3>
                    <Card className="border-border-primary/50 shadow-sm">
                        <CardContent className="pt-6">
                            {loading ? (
                              <Skeleton className="h-[200px] w-full" />
                            ) : (
                              <Textarea 
                                  value={stackDecisions} 
                                  onChange={(e) => setStackDecisions(e.target.value)} 
                                  className="font-mono text-sm min-h-[200px] bg-gray-50/30 focus:bg-white transition-colors"
                                  placeholder='{ "backend": "FastAPI" }'
                              />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="preview" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="min-h-[500px] border-border-primary/50 shadow-sm bg-white overflow-hidden">
                <CardContent className="pt-8 px-8 space-y-10">
                    {content || diagrams.length > 0 ? (
                        <div className="space-y-10">
                            {content && (
                              <div className="prose prose-slate max-w-none">
                                <Markdown>{content}</Markdown>
                              </div>
                            )}
                            
                            {/* Diagrams Section */}
                            {diagrams.length > 0 && (
                                <div className="pt-8 border-t border-gray-100">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-accent-blue" /> Architecture Diagrams
                                    </h3>
                                    <div className="space-y-10">
                                        {diagrams.map((diag, i) => (
                                            <div key={i} className="space-y-4">
                                                {diag.name && <h4 className="font-semibold text-gray-700 text-sm">{diag.name}</h4>}
                                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 overflow-hidden shadow-inner">
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
                                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Code2 className="w-4 h-4 text-orange-500" /> Tech Stack Decisions
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {Object.entries(s).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none block mb-2">{key}</span>
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
                        <div className="text-center py-20 text-gray-400 italic">
                            No architecture design yet. Switch to &quot;Write&quot; tab to begin.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
