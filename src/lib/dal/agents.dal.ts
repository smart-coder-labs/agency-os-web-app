import { prisma } from '@/lib/db';

export async function getAgentsByProjectId(projectId: string) {
  try {
    const agents = await prisma.agents.findMany({
      where: {
        OR: [
          { execution_logs: { some: { project_id: projectId } } },
          { collaborations_sent: { some: { project_id: projectId } } },
          { collaborations_received: { some: { project_id: projectId } } },
        ]
      },
      include: {
        agent_metrics: {
          orderBy: { created_at: 'desc' },
          take: 1
        },
        agent_jobs: true
      }
    });
    return agents;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch agents for project.');
  }
}

export async function getCollaborationsByProjectId(projectId: string) {
  try {
    const collaborations = await prisma.agent_collaborations.findMany({
      where: { project_id: projectId },
      include: {
        from_agent: true,
        to_agent: true
      },
      orderBy: { created_at: 'asc' }
    });
    return collaborations;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch collaborations for project.');
  }
}
