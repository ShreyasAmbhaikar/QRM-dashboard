import React from 'react';
import { getNotifications } from '@/features/notifications/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function NotificationsPage() {
  const response = await getNotifications();
  const notifications = response.success ? response.data : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications Center</h1>
          <p className="text-sm text-muted-foreground">
            System alerts, team updates, and automated notifications.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Inbox ({notifications.filter((n) => !n.isRead).length} Unread)
          </CardTitle>
          <CardDescription>Recent notifications across all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-colors flex items-start gap-4 ${
                  n.isRead
                    ? 'border-border bg-card/40'
                    : 'border-primary/40 bg-primary/5 shadow-sm'
                }`}
              >
                <div className="mt-0.5">
                  {n.type === 'ALERT' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  {n.type === 'SUCCESS' && <CheckCircle className="h-5 w-5 text-success" />}
                  {n.type === 'INFO' && <Info className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{n.title}</h4>
                    <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No notifications in your inbox.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
