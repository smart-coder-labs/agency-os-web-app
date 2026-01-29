import { getTaskById } from '@/lib/dal/tasks.dal'
import EditTaskForm from './EditTaskForm'

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const task = await getTaskById(id)

  if (!task) {
    return <div>Task not found</div>
  }

  return <EditTaskForm task={task} />
}
