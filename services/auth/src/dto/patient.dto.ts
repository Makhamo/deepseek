import { z } from "zod";

export const UpsertPatientDto = z.object({
  dateOfBirth: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD or ISO datetime"))
    .optional()
    .nullable(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"])
    .optional()
    .nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  emergencyContactName: z.string().max(200).optional().nullable(),
  emergencyContactPhone: z.string().max(30).optional().nullable(),
  medicalAidNumber: z.string().max(100).optional().nullable(),
});

export type UpsertPatientInput = z.infer<typeof UpsertPatientDto>;
