import { db } from '@/lib/db';
import { FeatureKey, PermissionLevel, DEFAULT_ROLE_PERMISSIONS } from './roles';
import { Role } from '@prisma/client';

export async function getUserPermissions(userId: string): Promise<{ role: Role; permissions: Record<FeatureKey, PermissionLevel> }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      permission: {
        select: {
          customPermissions: true,
          isCustomized: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const defaultMap = DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.VIEWER;

  if (!user.permission || !user.permission.isCustomized) {
    return { role: user.role, permissions: defaultMap };
  }

  const customMap = (user.permission.customPermissions as Record<FeatureKey, PermissionLevel>) || {};
  const mergedPermissions = { ...defaultMap, ...customMap };

  return { role: user.role, permissions: mergedPermissions };
}

export function withPermission(feature: FeatureKey, requiredLevel: 'full' | 'read' = 'read') {
  return async (userId: string): Promise<boolean> => {
    try {
      const { permissions } = await getUserPermissions(userId);
      const userLevel = permissions[feature] || 'none';

      if (userLevel === 'none') return false;
      if (requiredLevel === 'full' && userLevel !== 'full') return false;

      return true;
    } catch {
      return false;
    }
  };
}
