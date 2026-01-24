"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Markdown } from '@/components/ui/Markdown'
import { Card, CardContent } from '@/components/ui/Card'
import { Save, Eye, Edit2, Loader2, RefreshCw } from 'lucide-react'

export default function UiSpecsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const projectId = id
  const router = useRouter()
  const [designSystem, setDesignSystem] = useState('{}')
  const [components, setComponents] = useState('[]')
  const [wireframes, setWireframes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('write')

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/ui-specs/${projectId}`)
      if (r.ok) {
        const u = await r.json()
        setDesignSystem(JSON.stringify(u.design_system ?? {}, null, 2))
        setComponents(JSON.stringify(u.components ?? [], null, 2))
        setWireframes(u.wireframes_md || '')
      }
    } catch (error) {
       console.error("Failed to load ui specs", error)
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
        const res = await fetch(`/api/ui-specs/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                design_system: JSON.parse(designSystem || '{}'), 
                components: JSON.parse(components || '[]'), 
                wireframes_md: wireframes 
            })
        })
        if (!res.ok) throw new Error('Failed to save')
        router.refresh()
    } catch (error) {
        alert('Failed to save changes')
    } finally {
        setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <SectionHeader 
        title="UI Specifications" 
        description="Define design system tokens, components, and wireframes."
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
  )
}
