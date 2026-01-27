import { prisma } from '@/lib/db';

export async function getLogsByProjectId(projectId: string) {
  try {
    const logs = await prisma.execution_logs.findMany({
      where: { project_id: projectId },
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
