'use client';

import React, { useState, useEffect } from 'react';
import { getTasks, TaskWithRelations } from '@/features/tasks/actions';
import { TaskFormDialog } from '@/features/tasks/components/task-form';
import { RecurringTaskModal } from '@/features/tasks/components/recurring-task-modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, User, Repeat } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const STAGES: { label: string; status: string; color: string }[] = [
  { label: 'To Do', status: 'TODO', color: 'border-slate-700 bg-slate-900/30' },
  { label: 'In Progress', status: 'IN_PROGRESS', color: 'border-blue-500/30 bg-blue-500/5' },
  { label: 'Under Review', status: 'REVIEW', color: 'border-amber-500/30 bg-amber-500/5' },
  { label: 'Done', status: 'DONE', color: 'border-emerald-500/30 bg-emerald-500/5' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await getTasks();
    if (res.success) {
      setTasks(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agency Task Board</h1>
          <p className="text-sm text-muted-foreground">
            Manage SEO task execution, recurring deliverables, and client action items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsRecurringOpen(true)} className="gap-2 text-xs">
            <Repeat className="h-4 w-4" /> Recurrence Rules
          </Button>
          <Button onClick={() => setIsTaskFormOpen(true)} className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Create Task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STAGES.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className={`p-4 rounded-xl border ${col.color} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    {col.label}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {colTasks.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <Card key={task.id} className="border-border bg-card/60 hover:border-primary/40 transition-all text-xs">
                      <CardHeader className="p-3 pb-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={task.priority === 'HIGH' ? 'destructive' : 'outline'}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {task.priority}
                          </Badge>
                          {task.client && (
                            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">
                              {task.client.name}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xs font-semibold">{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2">
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee?.name || 'Unassigned'}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="p-4 text-center border border-dashed border-border rounded-lg text-muted-foreground text-[11px]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormDialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen} clients={[]} onSuccess={fetchTasks} />
      <RecurringTaskModal open={isRecurringOpen} onOpenChange={setIsRecurringOpen} />
    </div>
  );
}
