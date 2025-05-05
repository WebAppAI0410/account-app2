#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const patchesDir = path.join(__dirname, 'patches');

if (!fs.existsSync(patchesDir)) {
  console.log('No patches directory found. Skipping patches.');
  process.exit(0);
}

const patchFiles = fs.readdirSync(patchesDir);
if (patchFiles.length === 0) {
  console.log('No patch files found. Skipping patches.');
  process.exit(0);
}

console.log(`Found ${patchFiles.length} patch files to apply.`);

patchFiles.forEach(patchFile => {
  const patchPath = path.join(patchesDir, patchFile);
  try {
    console.log(`Applying patch: ${patchFile}`);
    execSync(`patch -p0 < ${patchPath}`, { stdio: 'inherit' });
    console.log(`Successfully applied patch: ${patchFile}`);
  } catch (error) {
    console.error(`Failed to apply patch ${patchFile}: ${error.message}`);
  }
});

console.log('All patches applied successfully.');
