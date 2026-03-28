'use client';

import { useEffect, useState, useCallback } from 'react';
import { SSEMessage, WorkspaceEvent, AgentStatus } from '../../../shared/types';

interface UseSSEStreamOptions {
  endpoint: string;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSSEStream({ 
  endpoint, 
  onMessage, 
  onError, 
  onConnect, 
  onDisconnect 
}: UseSSEStreamOptions) {
  const [events, setEvents] = useState<WorkspaceEvent[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      const eventSource = new EventSource(endpoint);

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          
          // Update events
          if (message.event === 'workspace-update' || message.event === 'agent-action') {
            const workspaceEvent = message.data as WorkspaceEvent;
            setEvents(prev => [workspaceEvent, ...prev].slice(0, 100)); // Keep last 100
          }

          // Update agent status
          if (message.event === 'system-status') {
            const agentStatus = message.data as AgentStatus;
            setAgents(prev => {
              const filtered = prev.filter(a => a.agent !== agentStatus.agent);
              return [...filtered, agentStatus];
            });
          }

          setLastUpdate(new Date().toISOString());
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        setIsConnected(false);
        const error = new Error('SSE connection failed');
        setError(error);
        onError?.(error);
        eventSource.close();
        onDisconnect?.();
      };

      return () => {
        eventSource.close();
        setIsConnected(false);
        onDisconnect?.();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    }
  }, [endpoint, onMessage, onError, onConnect, onDisconnect]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return {
    events,
    agents,
    isConnected,
    error,
    lastUpdate
  };
}