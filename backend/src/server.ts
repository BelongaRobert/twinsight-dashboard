import http from 'http';
import sqlite3 from 'sqlite3';
import { SSEMessage, WorkspaceEvent } from '../shared/types.ts';

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || './data/events.db';

const clients: Set<http.ServerResponse> = new Set();

function broadcast(event: SSEMessage) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach(client => {
    try { client.write(data); } 
    catch (err) { clients.delete(client); }
  });
}

function pollEvents() {
  const db = new sqlite3.Database(DB_PATH);
  db.all(`SELECT * FROM events WHERE processed = FALSE ORDER BY timestamp ASC`, 
    [], (err, rows: any[]) => {
    if (err) { console.error('DB error:', err); db.close(); return; }
    
    rows.forEach(row => {
      const event: WorkspaceEvent = {
        id: row.id, type: row.type, agent: row.agent,
        timestamp: row.timestamp, payload: JSON.parse(row.payload),
      };
      broadcast({ event: 'workspace_event', data: event });
      db.run('UPDATE events SET processed = TRUE WHERE id = ?', [row.id]);
    });
    db.close();
  });
}

setInterval(pollEvents, 2000);
setInterval(() => broadcast({
  event: 'ping', data: { timestamp: new Date().toISOString() }
}), 30000);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify({event:'ping',data:{timestamp:new Date().toISOString()}})}\n\n`);
    clients.add(res);
    req.on('close', () => clients.delete(res));
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', connections: clients.size }));
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`TwinSight Backend: http://localhost:${PORT}`);
  console.log(`SSE: http://localhost:${PORT}/api/stream`);
});