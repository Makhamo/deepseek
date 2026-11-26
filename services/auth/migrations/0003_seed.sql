-- Seed: service registry + base permissions (idempotent)
BEGIN;

INSERT INTO "service_registry" ("id", "key", "name", "base_url", "description", "is_active")
VALUES
  ('svc_lab', 'lab', 'Laboratory', 'http://localhost:4002', 'Lab orders & results', true),
  ('svc_appointment', 'appointment', 'Appointments', 'http://localhost:4003', 'Scheduling', true),
  ('svc_nicu', 'nicu', 'NICU', 'http://localhost:4004', 'Neonatal intensive care', true),
  ('svc_triage', 'triage', 'Triage', 'http://localhost:4005', 'Triage & acuity', true),
  ('svc_claims', 'claims', 'Claims', 'http://localhost:4006', 'Medical claims', true),
  ('svc_pharmacy', 'pharmacy', 'Pharmacy', 'http://localhost:4007', 'Prescriptions & dispensing', true),
  ('svc_auth', 'auth', 'Auth Hub', 'http://localhost:4001', 'Identity & access', true)
ON CONFLICT ("key") DO UPDATE SET
  "name" = EXCLUDED."name",
  "base_url" = EXCLUDED."base_url",
  "description" = EXCLUDED."description",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

INSERT INTO "service" ("id", "code", "name", "description", "is_active")
VALUES
  ('svcdef_lab', 'lab', 'Laboratory', 'Lab orders & results', true),
  ('svcdef_appointment', 'appointment', 'Appointments', 'Scheduling', true),
  ('svcdef_nicu', 'nicu', 'NICU', 'Neonatal intensive care', true),
  ('svcdef_triage', 'triage', 'Triage', 'Triage & acuity', true),
  ('svcdef_claims', 'claims', 'Claims', 'Medical claims', true),
  ('svcdef_pharmacy', 'pharmacy', 'Pharmacy', 'Prescriptions & dispensing', true)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "permission" ("id", "key", "name", "description", "service_key")
VALUES
  ('perm_users_read', 'tenant_admin:users', 'Manage users', 'List/create/update tenant users', 'auth'),
  ('perm_org_read', 'tenant_admin:org', 'Manage organization', 'Organization settings', 'auth'),
  ('perm_patient_read', 'patient:read', 'Read patient', 'View patient profile', 'auth'),
  ('perm_patient_write', 'patient:write', 'Write patient', 'Update patient profile', 'auth'),
  ('perm_appt_read', 'appointment:read', 'Read appointments', NULL, 'appointment'),
  ('perm_appt_write', 'appointment:write', 'Write appointments', NULL, 'appointment'),
  ('perm_lab_read', 'lab:read', 'Read lab', NULL, 'lab'),
  ('perm_lab_write', 'lab:write', 'Write lab', NULL, 'lab')
ON CONFLICT ("key") DO NOTHING;

-- Role bindings
INSERT INTO "role_permission" ("id", "role", "permission_id")
SELECT 'rp_admin_' || p.id, 'admin', p.id FROM "permission" p
ON CONFLICT DO NOTHING;

INSERT INTO "role_permission" ("id", "role", "permission_id")
SELECT 'rp_super_' || p.id, 'superadmin', p.id FROM "permission" p
ON CONFLICT DO NOTHING;

INSERT INTO "role_permission" ("id", "role", "permission_id")
VALUES
  ('rp_patient_read', 'patient', 'perm_patient_read'),
  ('rp_patient_appt_r', 'patient', 'perm_appt_read'),
  ('rp_patient_lab_r', 'patient', 'perm_lab_read')
ON CONFLICT DO NOTHING;

COMMIT;
