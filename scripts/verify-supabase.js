#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * Checks if Supabase is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Supabase Setup...\n');

let hasErrors = false;

// Check for .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  console.log('   → Copy .env.example to .env.local and fill in your Supabase credentials\n');
  hasErrors = true;
} else {
  console.log('✅ .env.local file exists');
  
  // Read and check env vars
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_EMAILS',
  ];
  
  const missingVars = [];
  requiredVars.forEach((varName) => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=`)) {
      const regex = new RegExp(`${varName}=(.+)`);
      const match = envContent.match(regex);
      if (!match || !match[1] || match[1].trim() === '' || match[1].includes('your_')) {
        missingVars.push(varName);
      }
    }
  });
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing or incomplete environment variables:`);
    missingVars.forEach((v) => console.error(`   → ${v}`));
    hasErrors = true;
  } else {
    console.log('✅ All required environment variables are set');
  }
}

// Check for schema files
const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
const storagePath = path.join(process.cwd(), 'supabase', 'storage_policies.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ supabase/schema.sql not found');
  hasErrors = true;
} else {
  console.log('✅ Database schema file exists');
}

if (!fs.existsSync(storagePath)) {
  console.error('❌ supabase/storage_policies.sql not found');
  hasErrors = true;
} else {
  console.log('✅ Storage policies file exists');
}

// Check for Supabase client files
const clientPath = path.join(process.cwd(), 'src', 'lib', 'supabase', 'client.ts');
const serverPath = path.join(process.cwd(), 'src', 'lib', 'supabase', 'server.ts');

if (!fs.existsSync(clientPath)) {
  console.error('❌ src/lib/supabase/client.ts not found');
  hasErrors = true;
} else {
  console.log('✅ Supabase client files exist');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ Setup incomplete. Please fix the errors above.');
  console.log('\n📖 See scripts/setup-supabase.md for detailed instructions.\n');
  process.exit(1);
} else {
  console.log('\n✅ Basic setup verification passed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Create Supabase project at supabase.com');
  console.log('   2. Execute supabase/schema.sql in SQL Editor');
  console.log('   3. Create "images" storage bucket');
  console.log('   4. Execute supabase/storage_policies.sql');
  console.log('   5. Test by running: npm run dev');
  console.log('   6. Visit: http://localhost:3000/focus-group/login\n');
  process.exit(0);
}








