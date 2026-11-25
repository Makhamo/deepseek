import { z } from 'zod';

/**
 * Fixed permission catalogue (spec §5.2). Permissions are `<resource>:<action>`.
 * Custom roles are combinations of these values; nothing outside this list is
 * grantable.
 */
export const RESOURCE_ACTIONS = {
  pm: ['read', 'write', 'order_lab'],
  tri: ['read', 'write', 'confirm'],
  lab: ['read', 'order', 'collect', 'verify', 'amend'],
  nicu: ['read', 'write', 'order_lab', 'acknowledge_critical'],
  ph: ['read', 'prescribe', 'dispense', 'reverse'],
  clm: ['read', 'submit', 'view_financial', 'adjust'],
  tenant_admin: ['users', 'roles', 'facilities', 'branding', 'relationships'],
  platform: ['tenants', 'entitlements', 'support', 'ledger'],
} as const satisfies Record<string, readonly string[]>;

export type Resource = keyof typeof RESOURCE_ACTIONS;

type ActionsFor<R extends Resource> = (typeof RESOURCE_ACTIONS)[R][number];

/** Every legal `<resource>:<action>` pair, for roles and token claims. */
export type Permission = {
  [R in Resource]: `${R}:${ActionsFor<R>}`;
}[Resource];

export const ALL_PERMISSIONS: readonly Permission[] = Object.entries(RESOURCE_ACTIONS).flatMap(
  ([resource, actions]) => actions.map((action) => `${resource}:${action}` as Permission),
);

const permissionSet: ReadonlySet<string> = new Set<string>(ALL_PERMISSIONS);

export function isPermission(value: string): value is Permission {
  return permissionSet.has(value);
}

export const PermissionSchema = z.string().refine(isPermission, {
  message: 'unknown permission; see RESOURCE_ACTIONS',
});

/** `perm` claim carried by an access token (spec §5.5). */
export const PermissionClaim = z.array(PermissionSchema);
