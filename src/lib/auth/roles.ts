import { Role } from '@prisma/client';

export type FeatureKey =
  | 'dashboard'
  | 'clients'
  | 'leads'
  | 'agreements'
  | 'gbp'
  | 'keywords'
  | 'competitors'
  | 'posts'
  | 'localGrid'
  | 'servicePages'
  | 'seoAudit'
  | 'autoReplies'
  | 'backlinks'
  | 'tasks'
  | 'performance'
  | 'notifications'
  | 'activityLog'
  | 'settings';

export type PermissionLevel = 'full' | 'read' | 'none';

export type PermissionMap = Record<FeatureKey, PermissionLevel>;

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
  SUPER_ADMIN: {
    dashboard: 'full',
    clients: 'full',
    leads: 'full',
    agreements: 'full',
    gbp: 'full',
    keywords: 'full',
    competitors: 'full',
    posts: 'full',
    localGrid: 'full',
    servicePages: 'full',
    seoAudit: 'full',
    autoReplies: 'full',
    backlinks: 'full',
    tasks: 'full',
    performance: 'full',
    notifications: 'full',
    activityLog: 'full',
    settings: 'full',
  },
  ADMIN: {
    dashboard: 'full',
    clients: 'full',
    leads: 'full',
    agreements: 'full',
    gbp: 'full',
    keywords: 'full',
    competitors: 'full',
    posts: 'full',
    localGrid: 'full',
    servicePages: 'full',
    seoAudit: 'full',
    autoReplies: 'full',
    backlinks: 'full',
    tasks: 'full',
    performance: 'full',
    notifications: 'full',
    activityLog: 'read',
    settings: 'read',
  },
  MANAGER: {
    dashboard: 'full',
    clients: 'full',
    leads: 'full',
    agreements: 'full',
    gbp: 'full',
    keywords: 'full',
    competitors: 'full',
    posts: 'full',
    localGrid: 'full',
    servicePages: 'full',
    seoAudit: 'full',
    autoReplies: 'full',
    backlinks: 'full',
    tasks: 'full',
    performance: 'full',
    notifications: 'full',
    activityLog: 'none',
    settings: 'none',
  },
  SEO_SPECIALIST: {
    dashboard: 'full',
    clients: 'read',
    leads: 'none',
    agreements: 'none',
    gbp: 'full',
    keywords: 'full',
    competitors: 'full',
    posts: 'read',
    localGrid: 'full',
    servicePages: 'full',
    seoAudit: 'full',
    autoReplies: 'read',
    backlinks: 'full',
    tasks: 'full',
    performance: 'full',
    notifications: 'read',
    activityLog: 'none',
    settings: 'none',
  },
  CONTENT_WRITER: {
    dashboard: 'full',
    clients: 'read',
    leads: 'none',
    agreements: 'none',
    gbp: 'read',
    keywords: 'read',
    competitors: 'none',
    posts: 'full',
    localGrid: 'none',
    servicePages: 'full',
    seoAudit: 'none',
    autoReplies: 'full',
    backlinks: 'none',
    tasks: 'full',
    performance: 'none',
    notifications: 'read',
    activityLog: 'none',
    settings: 'none',
  },
  VIEWER: {
    dashboard: 'read',
    clients: 'read',
    leads: 'read',
    agreements: 'read',
    gbp: 'read',
    keywords: 'read',
    competitors: 'read',
    posts: 'read',
    localGrid: 'read',
    servicePages: 'read',
    seoAudit: 'read',
    autoReplies: 'read',
    backlinks: 'read',
    tasks: 'read',
    performance: 'read',
    notifications: 'read',
    activityLog: 'none',
    settings: 'none',
  },
};
