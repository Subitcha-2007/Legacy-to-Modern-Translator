const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[INIT-DB] Initializing Legacy → Modern database runtime...');

try {
  // Generate client
  execSync('npx.cmd prisma generate', { stdio: 'inherit' });

  // Push schema to sqlite if needed
  execSync('npx.cmd prisma db push --skip-generate', { stdio: 'inherit' });

  console.log('[INIT-DB] Database schema verified and active.');
} catch (error) {
  console.error('[INIT-DB] Database initialization error:', error);
}
