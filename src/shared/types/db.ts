import type {
  projects,
  tasks,
  user_stories,
  agents,
  execution_logs,
  project_briefs,
  architecture_specs,
  ui_specs,
  project_artifacts,
  agent_jobs,
  agent_metrics,
  agent_collaborations,
} from '@prisma/client';

export type Project = projects;
export type Task = tasks;
export type UserStory = user_stories;
export type Agent = agents;
export type ExecutionLog = execution_logs;

export type ProjectWithRelations = projects & {
  project_briefs?: project_briefs | null;
  architecture_specs?: architecture_specs | null;
  ui_specs?: ui_specs | null;
  project_artifacts?: project_artifacts[];
};

export type AgentWithJobs = agents & {
  agent_jobs?: agent_jobs[];
  agent_metrics?: agent_metrics[];
};

export type TaskWithProject = tasks & {
  project?: Pick<projects, 'id' | 'name'> | null;
};

/** Display-ready task used in TasksTable — priority mapped to string label. */
export type FormattedTask = Omit<tasks, 'priority'> & {
  priority: string;
  project?: Pick<projects, 'id' | 'name'> | null;
};

/** Display-ready story used in StoriesTable — project relation injected at page level. */
export type FormattedStory = user_stories & {
  project?: Pick<projects, 'id' | 'name'> | null;
};
