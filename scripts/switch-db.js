const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2] || 'postgresql';
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found at:', schemaPath);
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

if (target === 'postgresql' || target === 'postgres') {
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('[DB-SWITCH] Switched Prisma schema to PostgreSQL for production deployment.');
} else if (target === 'sqlite') {
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('[DB-SWITCH] Switched Prisma schema to SQLite for local development.');
} else {
  console.error('Unknown target. Use "postgresql" or "sqlite".');
  process.exit(1);
}

try {
  execSync('npx.cmd prisma generate', { stdio: 'inherit' });
  console.log('[DB-SWITCH] Prisma client regenerated successfully.');
} catch (e) {
  console.warn('[DB-SWITCH] Note: Run prisma db push when your production database connection is set.');
}
