/**
 * Script to verify that all required database migrations have been executed
 * Run this after executing migrations in Supabase SQL Editor
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, try to read from process.env directly
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigrations() {
  console.log('🔍 Verifying database migrations...\n');

  const checks = [
    {
      name: 'Status and current_week columns in profiles',
      check: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('status, current_week')
          .limit(1);
        
        if (error && error.code === '42703') {
          return { passed: false, message: 'Columns do not exist' };
        }
        if (error) {
          return { passed: false, message: error.message };
        }
        return { passed: true, message: 'Columns exist' };
      },
    },
    {
      name: 'focus_group_feedback table',
      check: async () => {
        const { data, error } = await supabase
          .from('focus_group_feedback')
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') {
          return { passed: false, message: 'Table does not exist' };
        }
        if (error && error.code !== 'PGRST116') {
          return { passed: false, message: error.message };
        }
        return { passed: true, message: 'Table exists' };
      },
    },
    {
      name: 'focus_group_uploads table',
      check: async () => {
        const { data, error } = await supabase
          .from('focus_group_uploads')
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') {
          return { passed: false, message: 'Table does not exist' };
        }
        if (error && error.code !== 'PGRST116') {
          return { passed: false, message: error.message };
        }
        return { passed: true, message: 'Table exists' };
      },
    },
    {
      name: 'focus_group_messages table',
      check: async () => {
        const { data, error } = await supabase
          .from('focus_group_messages')
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') {
          return { passed: false, message: 'Table does not exist' };
        }
        if (error && error.code !== 'PGRST116') {
          return { passed: false, message: error.message };
        }
        return { passed: true, message: 'Table exists' };
      },
    },
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    try {
      const result = await check();
      if (result.passed) {
        console.log(`✅ ${name}: ${result.message}`);
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ ${name}: ${err.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All migrations verified successfully!');
    console.log('You can now test the Focus Group Portal features.');
  } else {
    console.log('❌ Some migrations are missing or incomplete.');
    console.log('Please execute the migration files in Supabase SQL Editor:');
    console.log('  1. supabase/migration_focus_group_status_week.sql');
    console.log('  2. supabase/migration_focus_group_tables.sql');
    console.log('  3. supabase/migration_focus_group_messages.sql');
    process.exit(1);
  }
}

verifyMigrations().catch((err) => {
  console.error('Error verifying migrations:', err);
  process.exit(1);
});

