import { z } from "zod";

export const CreateDepartmentDto = z.object({
  organizationId: z.string().min(1, "organizationId is required"),
  name: z.string().min(1, "name is required").max(200),
  description: z.string().max(1000).optional().nullable(),
});

export const UpdateDepartmentDto = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
});

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentDto>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentDto>;
