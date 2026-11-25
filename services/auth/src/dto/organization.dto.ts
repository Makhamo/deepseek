import { z } from "zod";

export const CreateOrganizationDto = z.object({
  name: z.string().min(1, "name is required").max(200),
  slug: z
    .string()
    .min(1, "slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  logo: z.string().url().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export const UpdateOrganizationDto = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  logo: z.string().url().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationDto>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationDto>;
