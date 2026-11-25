import { z } from "zod";

export const UpsertStaffDto = z.object({
  userId: z.string().min(1, "userId is required"),
  organizationId: z.string().min(1).optional().nullable(),
  departmentId: z.string().min(1).optional().nullable(),
  specialty: z.string().max(200).optional().nullable(),
  licenseNumber: z.string().max(100).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
});

export type UpsertStaffInput = z.infer<typeof UpsertStaffDto>;
