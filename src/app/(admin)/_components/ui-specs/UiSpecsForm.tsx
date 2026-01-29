"use client"

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Textarea } from '@/shared/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Markdown } from '@/shared/components/ui/Markdown'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { saveUiSpecs } from '@/app/(admin)/projects/_actions/ui-specs-actions'

interface UiSpecsFormProps {
  projectId: string;
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function UiSpecsForm({ projectId, initialData, onCancel, onSuccess }: UiSpecsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(!initialData)
  
  const [designSystem, setDesignSystem] = useState(JSON.stringify(initialData?.design_system ?? {}, null, 2))
  const [components, setComponents] = useState(JSON.stringify(initialData?.components ?? [], null, 2))
  const [wireframes, setWireframes] = useState(initialData?.wireframes_md || '')
  const [activeTab, setActiveTab] = useState('write')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/ui-specs/${projectId}`)
      if (r.ok) {
        const b = await r.json()
        setDesignSystem(JSON.stringify(b.design_system ?? {}, null, 2))
        setComponents(JSON.stringify(b.components ?? [], null, 2))
        setWireframes(b.wireframes_md || '')
      }
    } catch (error) {
       console.error("Failed to load UI specs", error)
       toast.error("Failed to load UI specs")
    } finally {
       setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!initialData) {
      loadData()
    }
  }, [initialData, loadData])

  function onSave() {
    startTransition(async () => {
      try {
        const designSystemJson = JSON.parse(designSystem || '{}')
        const componentsJson = JSON.parse(components || '[]')

        const result = await saveUiSpecs(projectId, {
          design_system: designSystemJson,
          components: componentsJson,
          wireframes_md: wireframes,
        })
        
        if (result.success) {
          toast.success(result.message)
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(`/projects/${projectId}`)
            router.refresh()
          }
        } else {
          throw new Error(result.message)
        }
      } catch (error: any) {
        toast.error('Failed to save changes', {
          description: error.message || 'Make sure JSON is valid.',
        })
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
        <TabsContent value="write" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="md:col-span-2 border-border-primary/50 shadow-sm">
                     <CardContent className="pt-6">
                        {loading ? (
                          <Skeleton className="h-[400px] w-full" />
                        ) : (
                          <Textarea 
                              label="Wireframes (Markdown)" 
                              value={wireframes} 
                              onChange={(e) => setWireframes(e.target.value)} 
                              className="font-mono text-sm min-h-[400px] bg-gray-50/30 focus:bg-white transition-colors"
                              placeholder="# Wireframes for Home Page..."
                          />
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border-primary/50 shadow-sm">
                    <CardContent className="pt-6">
                        {loading ? (
                          <Skeleton className="h-[300px] w-full" />
                        ) : (
                          <Textarea 
                              label="Design System (JSON)" 
                              value={designSystem} 
                              onChange={(e) => setDesignSystem(e.target.value)} 
                              className="font-mono text-sm min-h-[300px] bg-gray-50/30 focus:bg-white transition-colors"
                              placeholder='{ "colors": { "primary": "#..." } }'
                          />
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border-primary/50 shadow-sm">
                    <CardContent className="pt-6">
                        {loading ? (
                          <Skeleton className="h-[300px] w-full" />
                        ) : (
                          <Textarea 
                              label="Components (JSON)" 
                              value={components} 
                              onChange={(e) => setComponents(e.target.value)} 
                              className="font-mono text-sm min-h-[300px] bg-gray-50/30 focus:bg-white transition-colors"
                              placeholder='[ { "name": "Button", "props": "..." } ]'
                          />
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="preview" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-6">
                <Card className="min-h-[400px] border-border-primary/50 shadow-sm bg-white overflow-hidden">
                    <CardContent className="pt-8 px-8">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Wireframes Preview</h3>
                        <div className="prose prose-slate max-w-none">
                            {wireframes ? (
                                <Markdown>{wireframes}</Markdown>
                            ) : (
                                <div className="text-center py-12 text-gray-400 italic">
                                    No wireframes defined yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border-primary/50 shadow-sm bg-white overflow-hidden">
                        <CardContent className="pt-6">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Design System Token</h3>
                            <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[400px] shadow-inner">
                                {designSystem}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card className="border-border-primary/50 shadow-sm bg-white overflow-hidden">
                        <CardContent className="pt-6">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Component Specs</h3>
                            <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[400px] shadow-inner">
                                {components}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
