/**
 * Test User Setup Script
 * 
 * Creates a test user in Supabase for E2E testing.
 * Run with: node scripts/setup-test-user.js
 * 
 * Prerequisites:
 * - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in .env.local');
  process.exit(1);
}

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Test user configuration
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

/**
 * Create or verify test user exists
 */
async function setupTestUser() {
  console.log('🔧 Setting up test user for E2E testing...\n');
  console.log(`Email: ${TEST_EMAIL}`);
  console.log(`Password: ${TEST_PASSWORD}\n`);

  // Try to sign in first (user might already exist)
  const { data: authData, error: signInError } = await adminClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (!signInError && authData.user) {
    console.log('✅ Test user already exists');
    console.log(`   User ID: ${authData.user.id}`);
    
    // Check if profile exists
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profile) {
      console.log('✅ Profile already exists');
    } else {
      console.log('⚠️  Profile does not exist (user will be redirected to profile page on login)');
    }

    return { success: true, userId: authData.user.id, email: TEST_EMAIL };
  }

  // User doesn't exist, create it
  console.log('📝 Creating new test user...');
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true, // Auto-confirm email for testing
  });

  if (createError) {
    console.error('❌ Failed to create test user:', createError.message);
    return { success: false, error: createError.message };
  }

  console.log('✅ Test user created successfully');
  console.log(`   User ID: ${newUser.user.id}`);
  console.log(`   Email: ${newUser.user.email}`);
  console.log('\n📝 Note: Profile will be created when user logs in and completes profile form.');

  return { success: true, userId: newUser.user.id, email: TEST_EMAIL };
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await setupTestUser();
    
    if (result.success) {
      console.log('\n✅ Test user setup complete!');
      console.log('\nYou can now run E2E tests with:');
      console.log('  npm run test:e2e');
      console.log('\nOr set environment variables:');
      console.log(`  export TEST_USER_EMAIL="${result.email}"`);
      console.log(`  export TEST_USER_PASSWORD="${TEST_PASSWORD}"`);
      process.exit(0);
    } else {
      console.error('\n❌ Test user setup failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();




