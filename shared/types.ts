// TwinSight Dashboard - Shared Types
// Contract between UglyClaw (backend) and DaSage (frontend)

export interface TaskFrontmatter {
  status: 'in-progress' | 'done' | 'blocked';
  agent: 'uglyclaw' | 'dasage';
  project: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WorkspaceEvent {
  id: string;
  type: 'task_created' | 'task_updated' | 'file_modified' | 'command_run' | 'error';
  agent: 'uglyclaw' | 'dasage';
  timestamp: string;
  payload: TaskFrontmatter | FileEventPayload | CommandPayload | ErrorPayload;
}

export interface FileEventPayload {
  path: string;
  changeType: 'created' | 'modified' | 'deleted';
  size?: number;
}

export interface CommandPayload {
  command: string;
  exitCode: number;
  output?: string;
}

export interface ErrorPayload {
  message: string;
  stack?: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface SSEMessage {
  event: 'workspace_event' | 'ping' | 'error';
  data: WorkspaceEvent | { timestamp: string } | { message: string };
}

export const DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  agent TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  payload TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent ON events(agent);
CREATE INDEX IF NOT EXISTS idx_processed ON events(processed);
`;