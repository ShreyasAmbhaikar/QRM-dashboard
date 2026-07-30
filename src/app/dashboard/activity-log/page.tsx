import React from 'react';
import { getAuditLogs } from '@/features/audit-log/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Shield, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ActivityLogPage() {
  const response = await getAuditLogs(1, 50);
  const data = response.success ? response.data : { logs: [], total: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail & Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Immutable system log recording all mutation events (CREATE, UPDATE, DELETE) across the agency.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> System Events ({data.total})
          </CardTitle>
          <CardDescription>Chronological sequence of agency actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-border bg-card/40 flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 border border-primary/20">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {(log as { user?: { name: string } }).user?.name || 'System User'}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {log.action}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {log.resource}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Target Resource ID: <span className="font-mono text-foreground">{log.resourceId || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}

            {data.logs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No activity log records found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
