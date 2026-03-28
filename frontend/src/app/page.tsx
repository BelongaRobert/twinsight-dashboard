'use client';

import { useSSEStream } from '@/hooks/useSSEStream';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { events, agents, isConnected, error, lastUpdate } = useSSEStream({
    endpoint: 'http://localhost:3001/api/stream',
  });

  const uglyclawStatus = agents.find(a => a.agent === 'uglyclaw');
  const dasageStatus = agents.find(a => a.agent === 'dasage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">TwinSight Dashboard</h1>
            <p className="text-slate-400 mt-1">Real-time agent collaboration monitor</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-slate-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {lastUpdate && (
              <span className="text-xs text-slate-500">
                Last update: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Agent Status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 flex items-center justify-between">
                <span>Uglyclaw</span>
                <Badge 
                  variant={uglyclawStatus?.status === 'active' ? 'default' : 'secondary'}
                  className={uglyclawStatus?.status === 'active' ? 'bg-green-500' : ''}
                >
                  {uglyclawStatus?.status || 'unknown'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {uglyclawStatus?.currentTask || 'No active task'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 flex items-center justify-between">
                <span>DaSage</span>
                <Badge 
                  variant={dasageStatus?.status === 'active' ? 'default' : 'secondary'}
                  className={dasageStatus?.status === 'active' ? 'bg-green-500' : ''}
                >
                  {dasageStatus?.status || 'unknown'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {dasageStatus?.currentTask || 'Building frontend...'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed events={events} />
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(events.map(e => e.project))).map(project => (
                    project && (
                      <Badge key={project} variant="outline" className="border-slate-600 text-slate-300">
                        {project}
                      </Badge>
                    )
                  ))}
                  {events.length === 0 && (
                    <span className="text-slate-500 text-sm">No projects yet</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-red-400 text-sm">
                    Error: {error.message}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-slate-400">
                    <div>Waiting for backend connection... (port 3001)</div>
                    <div className="text-xs mt-2 text-slate-500">
                      SSE endpoint: /api/stream
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}