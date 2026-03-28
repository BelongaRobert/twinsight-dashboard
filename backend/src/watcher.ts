import chokidar from 'chokidar';
import fs from 'fs/promises';
import yaml from 'yaml';
import { v4 as uuidv4 } from 'uuid';
import { TaskFrontmatter, WorkspaceEvent } from '../shared/types.ts';

const WATCH_PATH = process.env.WATCH_PATH || '../../memory';
const DB_PATH = process.env.DB_PATH || './data/events.db';

async function parseFrontmatter(filePath: string): Promise<TaskFrontmatter | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) return null;
    const frontmatter = yaml.parse(match[1]);
    return frontmatter as TaskFrontmatter;
  } catch (err) {
    console.error(`Failed to parse ${filePath}:`, err);
    return null;
  }
}

async function queueEvent(event: WorkspaceEvent): Promise<void> {
  const db = await import('sqlite3').then(m => new m.default.Database(DB_PATH));
  const sql = `INSERT INTO events (id, type, agent, timestamp, payload) VALUES (?, ?, ?, ?, ?)`;
  
  await new Promise((resolve, reject) => {
    db.run(sql, [
      event.id, event.type, event.agent, event.timestamp,
      JSON.stringify(event.payload)
    ], function(err) {
      if (err) reject(err);
      else resolve(undefined);
    });
  });
  
  db.close();
  console.log(`Queued event: ${event.type} from ${event.agent}`);
}

export function startWatcher(agentName: 'uglyclaw' | 'dasage') {
  const watcher = chokidar.watch(`${WATCH_PATH}/**/*.md`, {
    persistent: true, ignoreInitial: false,
  });

  watcher
    .on('add', async (path) => {
      const fm = await parseFrontmatter(path);
      if (!fm) return;
      await queueEvent({ id: uuidv4(), type: 'task_created', agent: agentName,
        timestamp: new Date().toISOString(), payload: fm });
    })
    .on('change', async (path) => {
      const fm = await parseFrontmatter(path);
      if (!fm) return;
      await queueEvent({ id: uuidv4(), type: 'task_updated', agent: agentName,
        timestamp: new Date().toISOString(), payload: fm });
    })
    .on('error', (error) => console.error('Watcher error:', error));

  console.log(`Watcher started for ${agentName} on ${WATCH_PATH}`);
  return watcher;
}

if (import.meta.main) {
  startWatcher(process.env.AGENT_NAME as 'uglyclaw' | 'dasage' || 'uglyclaw');
}