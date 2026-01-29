import { getStoryById } from '@/lib/dal/user_stories.dal'
import EditUserStoryForm from './EditUserStoryForm'

interface EditUserStoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserStoryPage({ params }: EditUserStoryPageProps) {
  const { id } = await params
  const story = await getStoryById(id)

  if (!story) {
    return <div>User Story not found</div>
  }

  return <EditUserStoryForm story={story} />
}
