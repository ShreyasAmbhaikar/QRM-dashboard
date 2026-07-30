'use client';

import React, { useState } from 'react';
import { updateUserPermissions } from '../actions';
import { Badge } from '@/components/ui/badge';
import { User } from '@prisma/client';

interface RbacMatrixRowProps {
  user: User & { permission?: any };
}

const MODULE_KEYS = [
  'dashboard', 'clients', 'leads', 'agreements', 'gbp', 'keywords',
  'competitors', 'posts', 'localGrid', 'audits', 'servicePages',
  'autoReplies', 'backlinks', 'citations', 'tasks', 'performance',
  'notifications', 'settings'
];

export function RbacMatrixRow({ user }: RbacMatrixRowProps) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  let initialPerms: Record<string, string> = {};
  try {
    if (user.permission?.customPermissions) {
      initialPerms = typeof user.permission.customPermissions === 'string'
        ? JSON.parse(user.permission.customPermissions)
        : user.permission.customPermissions;
    }
  } catch (e) {}

  const [perms, setPerms] = useState<Record<string, string>>(initialPerms);

  const handleCellChange = async (modKey: string, value: string) => {
    const updated = { ...perms, [modKey]: value };
    setPerms(updated);
    await updateUserPermissions(user.id, updated);
  };

  return (
    <tr className="hover:bg-muted/10">
      <td className="p-3 font-semibold text-foreground sticky left-0 bg-card border-r border-border min-w-[150px]">
        <div className="flex flex-col">
          <span>{user.name}</span>
          <span className="text-[10px] text-muted-foreground font-normal">{user.email}</span>
          <Badge variant="outline" className="text-[9px] w-fit mt-1">{user.role}</Badge>
        </div>
      </td>

      {MODULE_KEYS.map((modKey) => {
        const val = isSuperAdmin ? 'full' : perms[modKey] || 'full';
        return (
          <td key={modKey} className="p-2 text-center">
            <select
              value={val}
              disabled={isSuperAdmin}
              onChange={(e) => handleCellChange(modKey, e.target.value)}
              className={`text-[10px] rounded border p-1 font-mono ${
                val === 'full' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                val === 'read' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                'bg-muted text-muted-foreground border-border'
              }`}
            >
              <option value="full">full</option>
              <option value="read">read</option>
              <option value="none">none</option>
            </select>
          </td>
        );
      })}
    </tr>
  );
}
