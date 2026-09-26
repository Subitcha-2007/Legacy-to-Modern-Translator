const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

console.log('--- Initializing Sakthimurugan Medical Agencies Local SQLite Database ---');

try {
  console.log('1. Pushing Prisma schema to SQLite...');
  execSync('npx.cmd prisma db push --accept-data-loss', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (e) {
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (err) {
    console.error('Prisma push warning:', err.message);
  }
}

try {
  console.log('2. Running SQLite seed check...');
  require('./seed.js');
} catch (err) {
  console.error('Seed execution note:', err.message);
}
