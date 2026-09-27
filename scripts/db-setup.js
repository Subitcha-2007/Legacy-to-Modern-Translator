const { execSync } = require('child_process');

console.log('[DB-SETUP] Initializing database...');

try {
  console.log('[DB-SETUP] Running prisma db push --force-reset...');
  execSync('npx.cmd prisma db push --force-reset --accept-data-loss', { stdio: 'inherit', env: process.env });
  
  console.log('[DB-SETUP] Generating Prisma Client...');
  execSync('npx.cmd prisma generate', { stdio: 'inherit', env: process.env });
  
  console.log('[DB-SETUP] Database setup completed successfully!');
} catch (error) {
  console.error('[DB-SETUP] Error setting up database:', error);
  process.exit(1);
}
