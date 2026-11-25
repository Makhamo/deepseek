import { z } from "zod";

export const CreateServiceDto = z.object({
  name: z.string().min(1, "name is required").max(200),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category: z
    .enum(["consultation", "lab", "pharmacy", "procedure", "imaging", "other"])
    .optional()
    .nullable(),
});

export const UpdateServiceDto = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  category: z
    .enum(["consultation", "lab", "pharmacy", "procedure", "imaging", "other"])
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export const LinkServiceToOrgDto = z.object({
  price: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : String(v))),
  currency: z.string().length(3).default("ZAR").optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof CreateServiceDto>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceDto>;
export type LinkServiceToOrgInput = z.infer<typeof LinkServiceToOrgDto>;
