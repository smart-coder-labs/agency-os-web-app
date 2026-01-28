import { getUiSpecByProjectId } from '@/lib/dal/ui_specs.dal'
import UiSpecsForm from './UiSpecsForm'

interface UiSpecsPageProps {
  params: { id: string };
}

export default async function UiSpecsPage({ params }: UiSpecsPageProps) {
  const { id } = params
  const uiSpec = await getUiSpecByProjectId(id)

  const initialData = {
    design_system: uiSpec?.design_system ?? {},
    components: uiSpec?.components ?? [],
    wireframes_md: uiSpec?.wireframes_md ?? ''
  }

  return <UiSpecsForm projectId={id} initialData={initialData} />
}
