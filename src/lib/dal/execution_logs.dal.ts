import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export async function getLogsByProjectId(projectId: string) {
  const user = await currentUser();
  if (!user) return [];

  try {
    const logs = await prisma.execution_logs.findMany({
      where: {
        project_id: projectId,
        projects: {
          user_id: user.id
        }
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        agents: true,
        tools: true
      }
    });
    return logs;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch execution logs for project.');
  }
}
