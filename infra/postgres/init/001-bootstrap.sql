-- Local development bootstrap. Runs once when the Postgres volume is created.
--
-- uhs_migrator owns tables and runs migrations.
-- uhs_app is the runtime role: no superuser, no BYPASSRLS, no DDL (spec §6.1).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'uhs_migrator') THEN
    CREATE ROLE uhs_migrator LOGIN PASSWORD 'uhs_migrator' CREATEDB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'uhs_app') THEN
    CREATE ROLE uhs_app LOGIN PASSWORD 'uhs_app'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;

SELECT format('CREATE DATABASE %I OWNER uhs_migrator', name)
FROM unnest(
  ARRAY['uhs_auth', 'uhs_core', 'uhs_doctor', 'uhs_triage', 'uhs_lab', 'uhs_nicu', 'uhs_pharmacy', 'uhs_claims']
) AS name
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = name)
\gexec

\connect uhs_auth
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_core
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_doctor
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_triage
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_lab
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_nicu
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_pharmacy
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;

\connect uhs_claims
GRANT USAGE ON SCHEMA public TO uhs_app;
GRANT CREATE ON SCHEMA public TO uhs_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO uhs_app;
ALTER DEFAULT PRIVILEGES FOR ROLE uhs_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO uhs_app;
