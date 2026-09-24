export const workspaceRoles = ["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

export const permissions = [
  "workspace:manage",
  "members:manage",
  "billing:manage",
  "phrase:read",
  "phrase:write",
  "speech:create",
  "usage:read",
  "audit:read",
  "api-key:manage",
] as const;

export type Permission = (typeof permissions)[number];

const rolePermissions = {
  OWNER: permissions,
  ADMIN: [
    "members:manage",
    "phrase:read",
    "phrase:write",
    "speech:create",
    "usage:read",
    "audit:read",
    "api-key:manage",
  ],
  EDITOR: ["phrase:read", "phrase:write", "speech:create", "usage:read"],
  VIEWER: ["phrase:read", "usage:read"],
} satisfies Record<WorkspaceRole, readonly Permission[]>;

export function isWorkspaceRole(value: string): value is WorkspaceRole {
  return workspaceRoles.includes(value as WorkspaceRole);
}

export function can(role: WorkspaceRole, permission: Permission): boolean {
  return (rolePermissions[role] as readonly Permission[]).includes(permission);
}

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";

  constructor(
    readonly role: WorkspaceRole,
    readonly permission: Permission,
  ) {
    super(`${role} does not have ${permission}`);
    this.name = "AuthorizationError";
  }
}

export function requirePermission(
  role: WorkspaceRole,
  permission: Permission,
): void {
  if (!can(role, permission)) {
    throw new AuthorizationError(role, permission);
  }
}
