import { z } from "zod";

export const CreatePermissionDto = z.object({
  key: z
    .string()
    .min(1, "key is required")
    .max(100)
    .regex(
      /^[a-z0-9]+(?::[a-z0-9]+)*$/,
      "key must be like 'resource:action' (lowercase)"
    ),
  name: z.string().min(1, "name is required").max(200),
  description: z.string().max(500).optional().nullable(),
});

export const AssignPermissionDto = z.object({
  permissionId: z.string().min(1, "permissionId is required"),
});

export type CreatePermissionInput = z.infer<typeof CreatePermissionDto>;
export type AssignPermissionInput = z.infer<typeof AssignPermissionDto>;
