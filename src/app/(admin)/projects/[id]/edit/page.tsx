import { getProjectById } from '@/lib/dal/projects.dal'
import EditProjectForm from './EditProjectForm'

interface EditProjectPageProps {
  params: { id: string };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = params
  const project = await getProjectById(id)

  if (!project) {
    return <div>Project not found</div>
  }

  return <EditProjectForm project={project} />
}
