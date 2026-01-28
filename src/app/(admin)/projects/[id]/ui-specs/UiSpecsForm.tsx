"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { Textarea } from '@/shared/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs'
import { Markdown } from '@/shared/components/ui/Markdown'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Save, Eye, Edit2, Loader2 } from 'lucide-react'
import { saveUiSpecs } from '../../_actions/ui-specs-actions'

export default function UiSpecsForm({ projectId, initialData }: { projectId: string, initialData: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [designSystem, setDesignSystem] = useState(JSON.stringify(initialData.design_system ?? {}, null, 2))
  const [components, setComponents] = useState(JSON.stringify(initialData.components ?? [], null, 2))
  const [wireframes, setWireframes] = useState(initialData.wireframes_md || '')
  const [activeTab, setActiveTab] = useState('write')

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
          router.push(`/projects/${projectId}`)
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <SectionHeader 
        title="UI Specifications" 
        description="Define design system tokens, components, and wireframes."
        actions={
            <div className="flex items-center gap-2">
                <Button 
                    onClick={onSave} 
                    disabled={isPending}
                    leftIcon={isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4" />}
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        }
      />
      
      {/* ... el resto del JSX no cambia ... */}

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
                            label="Wireframes (Markdown)" 
                            value={wireframes} 
                            onChange={(e) => setWireframes(e.target.value)} 
                            className="font-mono text-sm min-h-[400px]"
                            placeholder="# Wireframes for Home Page..."
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Textarea 
                            label="Design System (JSON)" 
                            value={designSystem} 
                            onChange={(e) => setDesignSystem(e.target.value)} 
                            className="font-mono text-sm min-h-[300px]"
                            placeholder='{ "colors": { "primary": "#..." } }'
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Textarea 
                            label="Components (JSON)" 
                            value={components} 
                            onChange={(e) => setComponents(e.target.value)} 
                            className="font-mono text-sm min-h-[300px]"
                            placeholder='[ { "name": "Button", "props": "..." } ]'
                        />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="preview">
            <div className="space-y-6">
                <Card className="min-h-[300px]">
                    <CardContent className="pt-8 px-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 border-b pb-2">Wireframes</h3>
                        <div>
                            {wireframes ? (
                                <Markdown>{wireframes}</Markdown>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No wireframes defined.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Design System</h3>
                            <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[400px]">
                                {designSystem}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Components</h3>
                            <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-auto max-h-[400px]">
                                {components}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
)}


