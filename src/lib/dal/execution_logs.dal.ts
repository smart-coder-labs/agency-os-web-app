import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export async function getRecentActivity(limit = 10) {
  const user = await currentUser();
  if (!user) return [];

  try {
    return await prisma.execution_logs.findMany({
      where: {
        projects: { user_id: user.id },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        agents: { select: { name: true, role: true } },
        projects: { select: { id: true, name: true } },
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

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
