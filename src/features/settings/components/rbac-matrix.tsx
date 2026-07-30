'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { RbacMatrixHeader } from './rbac-matrix-header';
import { RbacMatrixRow } from './rbac-matrix-row';

interface RbacMatrixProps {
  users: any[];
}

export function RbacMatrix({ users }: RbacMatrixProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Super Admin 18-Module RBAC Permission Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-left text-xs">
            <RbacMatrixHeader />
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <RbacMatrixRow key={u.id} user={u} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={19} className="p-6 text-center text-muted-foreground">No team members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
