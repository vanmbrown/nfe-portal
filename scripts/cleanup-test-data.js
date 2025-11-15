/**
 * Test Data Cleanup Script
 * 
 * Cleans up test data created during E2E testing.
 * Run with: node scripts/cleanup-test-data.js
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

// Configuration
const TEST_EMAIL_PATTERN = process.env.TEST_EMAIL_PATTERN || 'test-.*@example.com';
const DRY_RUN = process.env.DRY_RUN === 'true';

/**
 * Clean up test users and their data
 */
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No data will be deleted\n');
  }

  try {
    // Get all users
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      return false;
    }

    // Filter test users (email matches pattern or contains 'test')
    const testUsers = users.users.filter(user => {
      const email = user.email || '';
      return email.includes('test') || 
             email.match(new RegExp(TEST_EMAIL_PATTERN)) ||
             email.includes('@example.com');
    });

    if (testUsers.length === 0) {
      console.log('✅ No test users found to clean up');
      return true;
    }

    console.log(`Found ${testUsers.length} test user(s) to clean up:\n`);

    for (const user of testUsers) {
      console.log(`  - ${user.email} (${user.id})`);
      
      if (!DRY_RUN) {
        // Delete user's data first (profiles, feedback, uploads)
        const userId = user.id;
        
        // Delete feedback
        const { error: feedbackError } = await adminClient
          .from('focus_group_feedback')
          .delete()
          .eq('user_id', userId);
        
        if (feedbackError) {
          console.error(`    ⚠️  Failed to delete feedback: ${feedbackError.message}`);
        } else {
          console.log('    ✅ Deleted feedback');
        }

        // Delete uploads (images)
        const { error: imagesError } = await adminClient
          .from('focus_group_images')
          .delete()
          .eq('user_id', userId);
        
        if (imagesError) {
          console.error(`    ⚠️  Failed to delete images: ${imagesError.message}`);
        } else {
          console.log('    ✅ Deleted images');
        }

        // Delete profile
        const { error: profileError } = await adminClient
          .from('profiles')
          .delete()
          .eq('user_id', userId);
        
        if (profileError) {
          console.error(`    ⚠️  Failed to delete profile: ${profileError.message}`);
        } else {
          console.log('    ✅ Deleted profile');
        }

        // Delete user
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`    ❌ Failed to delete user: ${deleteError.message}`);
        } else {
          console.log('    ✅ Deleted user\n');
        }
      } else {
        console.log('    (would be deleted in real run)\n');
      }
    }

    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN complete - no data was actually deleted');
      console.log('   Run without DRY_RUN=true to actually delete data');
    } else {
      console.log('✅ Cleanup complete');
    }

    return true;
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    return false;
  }
}

/**
 * Clean up specific test user by email
 */
async function cleanupSpecificUser(email) {
  console.log(`🧹 Cleaning up test user: ${email}\n`);

  try {
    // Find user by email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      return false;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`✅ User ${email} not found (already deleted or doesn't exist)`);
      return true;
    }

    const userId = user.id;
    console.log(`Found user: ${user.id}`);

    if (!DRY_RUN) {
      // Delete user's data
      await adminClient.from('focus_group_feedback').delete().eq('user_id', userId);
      await adminClient.from('focus_group_images').delete().eq('user_id', userId);
      await adminClient.from('profiles').delete().eq('user_id', userId);
      
      // Delete user
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('❌ Failed to delete user:', deleteError.message);
        return false;
      }

      console.log('✅ User and all associated data deleted');
    } else {
      console.log('⚠️  DRY RUN - user would be deleted');
    }

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];

  if (email) {
    // Clean up specific user
    const result = await cleanupSpecificUser(email);
    process.exit(result ? 0 : 1);
  } else {
    // Clean up all test users
    const result = await cleanupTestData();
    process.exit(result ? 0 : 1);
  }
}

main();




