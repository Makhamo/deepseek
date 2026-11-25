import { runMigrations } from '@uhs/service-kit';
import { loadServiceConfig } from '../config.js';

const config = loadServiceConfig();

runMigrations({
  databaseUrl: config.MIGRATION_DATABASE_URL,
  migrationsFolder: './migrations',
})
  .then(() => {
    process.stdout.write('migrations applied for claims\n');
  })
  .catch((error: unknown) => {
    process.stderr.write(
      'migration failed: ' + (error instanceof Error ? error.message : String(error)) + '\n',
    );
    process.exit(1);
  });
