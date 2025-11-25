#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const seedPath = path.join(__dirname, '../data/seed.json');

async function generatePasswordHash(password) {
  return await bcrypt.hash(password, 10);
}

async function updatePasswordHashes() {
  console.log('Reading seed data...');
  const data = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  console.log('Updating password hashes...');

  // Update all user passwords to bcrypt hashes
  for (const user of data.users) {
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      user.password = await generatePasswordHash('password123');
    }
  }

  fs.writeFileSync(seedPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('✅ Seed data updated successfully!');
  console.log('All users now have password: password123');
}

console.log('🌱 OB Digital Portal - Data Seed Script');
console.log('========================================\n');

updatePasswordHashes()
  .then(() => {
    console.log('\n✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });
