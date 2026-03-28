'use client';

import { useMemo } from 'react';
import { WorkspaceEvent } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ActivityFeedProps {
  events: WorkspaceEvent[];
  maxItems?: number;
}

const eventTypeColors: Record<string, string> = {
  'file-edit': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'command': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'research': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'status-change': 'bg-green-500/20 text-green-400 border-green-500/30',
};

const agentColors: Record<string, string> = {
  'uglyclaw': 'text-orange-400',
  'dasage': 'text-cyan-400',
};

export function ActivityFeed({ events, maxItems = 50 }: ActivityFeedProps) {
  const displayEvents = useMemo(() => {
    return events.slice(0, maxItems);
  }, [events, maxItems]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'file-edit': return '📝';
      case 'command': return '⚡';
      case 'research': return '🔍';
      case 'status-change': return '✓';
      default: return '•';
    }
  };

  return (
    <Card className="h-[500px] flex flex-col bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <span>Activity Stream</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {events.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-3">
            {displayEvents.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                Waiting for events...
              </div>
            ) : (
              displayEvents.map((event, index) => (
                <div key={event.id || index}>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${agentColors[event.agent] || 'text-slate-400'}`}>
                          @{event.agent}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${eventTypeColors[event.type] || 'text-slate-400'}`}
                        >
                          {event.type}
                        </Badge>
                        <span className="text-xs text-slate-500 ml-auto">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-300 truncate">
                        {event.description}
                      </p>
                      
                      {event.filePath && (
                        <p className="text-xs text-slate-500 mt-1 font-mono truncate">
                          {event.filePath}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < displayEvents.length - 1 && <Separator className="bg-slate-700/30" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}