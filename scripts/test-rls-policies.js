/**
 * RLS Policy Testing Script
 * 
 * This script tests Row Level Security policies to ensure data isolation.
 * Run with: node scripts/test-rls-policies.js
 * 
 * Prerequisites:
 * - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 * - Two test users must exist in Supabase
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

// Create admin client (bypasses RLS for testing)
// Service role key automatically bypasses RLS
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Test configuration
const TEST_CONFIG = {
  user1Email: process.env.TEST_USER1_EMAIL || 'testuser1@example.com',
  user2Email: process.env.TEST_USER2_EMAIL || 'testuser2@example.com',
  user1Password: process.env.TEST_USER1_PASSWORD || 'TestPassword123!',
  user2Password: process.env.TEST_USER2_PASSWORD || 'TestPassword123!',
};

let user1Client = null;
let user2Client = null;
let user1Id = null;
let user2Id = null;

/**
 * Create test users if they don't exist
 */
async function setupTestUsers() {
  console.log('🔧 Setting up test users...\n');

  // Try to sign in or create user1
  const { data: auth1, error: signInError1 } = await adminClient.auth.signInWithPassword({
    email: TEST_CONFIG.user1Email,
    password: TEST_CONFIG.user1Password,
  });

  if (signInError1) {
    // User doesn't exist, create it
    const { data: newUser1, error: createError1 } = await adminClient.auth.admin.createUser({
      email: TEST_CONFIG.user1Email,
      password: TEST_CONFIG.user1Password,
      email_confirm: true,
    });

    if (createError1) {
      console.error('❌ Failed to create user1:', createError1.message);
      return false;
    }
    user1Id = newUser1.user.id;
    console.log('✅ Created user1:', TEST_CONFIG.user1Email);
  } else {
    user1Id = auth1.user.id;
    console.log('✅ User1 already exists:', TEST_CONFIG.user1Email);
  }

  // Try to sign in or create user2
  const { data: auth2, error: signInError2 } = await adminClient.auth.signInWithPassword({
    email: TEST_CONFIG.user2Email,
    password: TEST_CONFIG.user2Password,
  });

  if (signInError2) {
    // User doesn't exist, create it
    const { data: newUser2, error: createError2 } = await adminClient.auth.admin.createUser({
      email: TEST_CONFIG.user2Email,
      password: TEST_CONFIG.user2Password,
      email_confirm: true,
    });

    if (createError2) {
      console.error('❌ Failed to create user2:', createError2.message);
      return false;
    }
    user2Id = newUser2.user.id;
    console.log('✅ Created user2:', TEST_CONFIG.user2Email);
  } else {
    user2Id = auth2.user.id;
    console.log('✅ User2 already exists:', TEST_CONFIG.user2Email);
  }

  // Create authenticated clients for each user
  const { data: session1 } = await adminClient.auth.signInWithPassword({
    email: TEST_CONFIG.user1Email,
    password: TEST_CONFIG.user1Password,
  });

  const { data: session2 } = await adminClient.auth.signInWithPassword({
    email: TEST_CONFIG.user2Email,
    password: TEST_CONFIG.user2Password,
  });

  user1Client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${session1.session.access_token}`,
      },
    },
  });

  user2Client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${session2.session.access_token}`,
      },
    },
  });

  return true;
}

/**
 * Test 1: Profile Isolation
 */
async function testProfileIsolation() {
  console.log('\n📋 Test 1: Profile Isolation');
  console.log('─'.repeat(50));

  // Create profiles for both users (as admin)
  // Service role should bypass RLS, but if it doesn't, we'll handle it
  // First, try to delete existing profiles to avoid conflicts
  await adminClient
    .from('profiles')
    .delete()
    .eq('user_id', user1Id);
  
  await adminClient
    .from('profiles')
    .delete()
    .eq('user_id', user2Id);

  // Try using RPC function first (bypasses RLS), fallback to direct insert
  let profile1Error = null;
  let profile2Error = null;

  // Try RPC function if available
  const { error: rpcError1 } = await adminClient.rpc('admin_insert_profile', {
    p_user_id: user1Id,
    p_age_range: '26-35',
    p_top_concerns: ['acne'],
  });

  if (rpcError1) {
    // Fallback to direct insert
    const result = await adminClient
      .from('profiles')
      .insert({
        user_id: user1Id,
        age_range: '26-35',
        top_concerns: ['acne'],
      });
    profile1Error = result.error;
  }

  const { error: rpcError2 } = await adminClient.rpc('admin_insert_profile', {
    p_user_id: user2Id,
    p_age_range: '36-45',
    p_top_concerns: ['wrinkles'],
  });

  if (rpcError2) {
    // Fallback to direct insert
    const result = await adminClient
      .from('profiles')
      .insert({
        user_id: user2Id,
        age_range: '36-45',
        top_concerns: ['wrinkles'],
      });
    profile2Error = result.error;
  }

  if (profile1Error) {
    console.error('❌ Failed to create profile1:', profile1Error.message);
    console.error('   Details:', JSON.stringify(profile1Error, null, 2));
    return false;
  }

  if (profile2Error) {
    console.error('❌ Failed to create profile2:', profile2Error.message);
    console.error('   Details:', JSON.stringify(profile2Error, null, 2));
    return false;
  }

  // User1 should only see their own profile
  const { data: user1Profiles, error: user1Error } = await user1Client
    .from('profiles')
    .select('*');

  if (user1Error) {
    console.error('❌ User1 query failed:', user1Error.message);
    return false;
  }

  if (user1Profiles.length !== 1 || user1Profiles[0].user_id !== user1Id) {
    console.error('❌ User1 can see more than their own profile!');
    console.error('   Expected: 1 profile for user', user1Id);
    console.error('   Found:', user1Profiles.length, 'profiles');
    if (user1Profiles.length > 0) {
      console.error('   Profile user_ids:', user1Profiles.map(p => p.user_id));
    }
    console.error('   ⚠️  This indicates RLS policies are not working correctly!');
    console.error('   💡 Check: Is RLS enabled on the profiles table?');
    console.error('   💡 Check: Are policies correctly defined?');
    return false;
  }

  console.log('✅ User1 can only see their own profile');

  // User2 should only see their own profile
  const { data: user2Profiles, error: user2Error } = await user2Client
    .from('profiles')
    .select('*');

  if (user2Error) {
    console.error('❌ User2 query failed:', user2Error.message);
    return false;
  }

  if (user2Profiles.length !== 1 || user2Profiles[0].user_id !== user2Id) {
    console.error('❌ User2 can see more than their own profile!');
    console.error('   Found:', user2Profiles.length, 'profiles');
    return false;
  }

  console.log('✅ User2 can only see their own profile');
  return true;
}

/**
 * Test 2: Feedback Isolation
 */
async function testFeedbackIsolation() {
  console.log('\n📋 Test 2: Feedback Isolation');
  console.log('─'.repeat(50));

  // First, check if feedback table exists and has the correct columns
  const { data: tableCheck, error: tableError } = await adminClient
    .from('feedback')
    .select('id')
    .limit(0);

  if (tableError && tableError.code === 'PGRST204') {
    console.error('❌ Feedback table schema issue detected');
    console.error('   Error:', tableError.message);
    console.error('   💡 The feedback table may not exist or have different columns');
    console.error('   💡 Run supabase/schema.sql in Supabase SQL Editor to create/update the table');
    return false;
  }

  // Create feedback for both users (as admin)
  // Try using RPC function first (bypasses RLS), fallback to direct insert
  let feedback1Error = null;
  let feedback2Error = null;

  // Try RPC function if available
  const { error: rpcError1 } = await adminClient.rpc('admin_insert_feedback', {
    p_user_id: user1Id,
    p_week: 1,
    p_hydration_rating: 4,
    p_tone_rating: 4,
    p_texture_rating: 4,
    p_overall_rating: 4,
    p_notes: 'User1 feedback',
  });

  if (rpcError1) {
    // Fallback to direct insert (using 'week' not 'week_number')
    const result = await adminClient
      .from('feedback')
      .insert({
        user_id: user1Id,
        week: 1,  // Note: column is 'week' not 'week_number'
        hydration_rating: 4,
        tone_rating: 4,
        texture_rating: 4,
        overall_rating: 4,
        notes: 'User1 feedback',
      })
      .select()
      .single();
    feedback1Error = result.error;
  }

  // If error is due to unique constraint, try to delete and re-insert
  if (feedback1Error && feedback1Error.code === '23505') {
    // Delete existing feedback for this user/week
    await adminClient
      .from('feedback')
      .delete()
      .eq('user_id', user1Id)
      .eq('week', 1);  // Note: column is 'week' not 'week_number'
    
    // Try insert again
    const { error: retryError } = await adminClient
      .from('feedback')
      .insert({
        user_id: user1Id,
        week: 1,  // Note: column is 'week' not 'week_number'
        hydration_rating: 4,
        tone_rating: 4,
        texture_rating: 4,
        overall_rating: 4,
        notes: 'User1 feedback',
      });
    
    if (retryError) {
      console.error('❌ Failed to create feedback1 after retry:', retryError.message);
      return false;
    }
  } else if (feedback1Error) {
    console.error('❌ Failed to create feedback1:', feedback1Error.message);
    return false;
  }

  const { error: rpcError2 } = await adminClient.rpc('admin_insert_feedback', {
    p_user_id: user2Id,
    p_week: 1,
    p_hydration_rating: 5,
    p_tone_rating: 5,
    p_texture_rating: 5,
    p_overall_rating: 5,
    p_notes: 'User2 feedback',
  });

  if (rpcError2) {
    // Fallback to direct insert (using 'week' not 'week_number')
    const result = await adminClient
      .from('feedback')
      .insert({
        user_id: user2Id,
        week: 1,  // Note: column is 'week' not 'week_number'
        hydration_rating: 5,
        tone_rating: 5,
        texture_rating: 5,
        overall_rating: 5,
        notes: 'User2 feedback',
      })
      .select()
      .single();
    feedback2Error = result.error;
  }

  // If error is due to unique constraint, try to delete and re-insert
  if (feedback2Error && feedback2Error.code === '23505') {
    // Delete existing feedback for this user/week
    await adminClient
      .from('feedback')
      .delete()
      .eq('user_id', user2Id)
      .eq('week', 1);  // Note: column is 'week' not 'week_number'
    
    // Try insert again
    const { error: retryError } = await adminClient
      .from('feedback')
      .insert({
        user_id: user2Id,
        week: 1,  // Note: column is 'week' not 'week_number'
        hydration_rating: 5,
        tone_rating: 5,
        texture_rating: 5,
        overall_rating: 5,
        notes: 'User2 feedback',
      });
    
    if (retryError) {
      console.error('❌ Failed to create feedback2 after retry:', retryError.message);
      return false;
    }
  } else if (feedback2Error) {
    console.error('❌ Failed to create feedback2:', feedback2Error.message);
    console.error('   Details:', JSON.stringify(feedback2Error, null, 2));
    return false;
  }

  // User1 should only see their own feedback
  const { data: user1Feedback, error: user1Error } = await user1Client
    .from('feedback')
    .select('*');

  if (user1Error) {
    console.error('❌ User1 query failed:', user1Error.message);
    return false;
  }

  if (user1Feedback.length !== 1 || user1Feedback[0].user_id !== user1Id) {
    console.error('❌ User1 can see more than their own feedback!');
    console.error('   Found:', user1Feedback.length, 'feedback entries');
    return false;
  }

  console.log('✅ User1 can only see their own feedback');

  // User2 should only see their own feedback
  const { data: user2Feedback, error: user2Error } = await user2Client
    .from('feedback')
    .select('*');

  if (user2Error) {
    console.error('❌ User2 query failed:', user2Error.message);
    return false;
  }

  if (user2Feedback.length !== 1 || user2Feedback[0].user_id !== user2Id) {
    console.error('❌ User2 can see more than their own feedback!');
    console.error('   Found:', user2Feedback.length, 'feedback entries');
    return false;
  }

  console.log('✅ User2 can only see their own feedback');
  return true;
}

/**
 * Test 3: Image Isolation
 */
async function testImageIsolation() {
  console.log('\n📋 Test 3: Image Isolation');
  console.log('─'.repeat(50));

  // Create images for both users (as admin)
  // First, clean up any existing test images
  await adminClient
    .from('images')
    .delete()
    .eq('user_id', user1Id)
    .eq('filename', 'user1-before.jpg');
  
  await adminClient
    .from('images')
    .delete()
    .eq('user_id', user2Id)
    .eq('filename', 'user2-before.jpg');

  // Try using RPC function first (bypasses RLS), fallback to direct insert
  let image1Error = null;
  let image2Error = null;

  // Try RPC function if available
  const { error: rpcError1 } = await adminClient.rpc('admin_insert_image', {
    p_user_id: user1Id,
    p_type: 'before',
    p_filename: 'user1-before.jpg',
    p_url: 'https://example.com/user1-before.jpg',
    p_mime_type: 'image/jpeg',
    p_size: 1024,
  });

  if (rpcError1) {
    // Fallback to direct insert
    const result = await adminClient
      .from('images')
      .insert({
        user_id: user1Id,
        type: 'before',
        filename: 'user1-before.jpg',
        url: 'https://example.com/user1-before.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
      });
    image1Error = result.error;
  }

  const { error: rpcError2 } = await adminClient.rpc('admin_insert_image', {
    p_user_id: user2Id,
    p_type: 'before',
    p_filename: 'user2-before.jpg',
    p_url: 'https://example.com/user2-before.jpg',
    p_mime_type: 'image/jpeg',
    p_size: 2048,
  });

  if (rpcError2) {
    // Fallback to direct insert
    const result = await adminClient
      .from('images')
      .insert({
        user_id: user2Id,
        type: 'before',
        filename: 'user2-before.jpg',
        url: 'https://example.com/user2-before.jpg',
        mime_type: 'image/jpeg',
        size: 2048,
      });
    image2Error = result.error;
  }

  if (image1Error) {
    console.error('❌ Failed to create image1:', image1Error.message);
    console.error('   Details:', JSON.stringify(image1Error, null, 2));
    return false;
  }

  if (image2Error) {
    console.error('❌ Failed to create image2:', image2Error.message);
    console.error('   Details:', JSON.stringify(image2Error, null, 2));
    return false;
  }

  // User1 should only see their own images
  const { data: user1Images, error: user1Error } = await user1Client
    .from('images')
    .select('*');

  if (user1Error) {
    console.error('❌ User1 query failed:', user1Error.message);
    return false;
  }

  if (user1Images.length !== 1 || user1Images[0].user_id !== user1Id) {
    console.error('❌ User1 can see more than their own images!');
    console.error('   Found:', user1Images.length, 'images');
    return false;
  }

  console.log('✅ User1 can only see their own images');

  // User2 should only see their own images
  const { data: user2Images, error: user2Error } = await user2Client
    .from('images')
    .select('*');

  if (user2Error) {
    console.error('❌ User2 query failed:', user2Error.message);
    return false;
  }

  if (user2Images.length !== 1 || user2Images[0].user_id !== user2Id) {
    console.error('❌ User2 can see more than their own images!');
    console.error('   Found:', user2Images.length, 'images');
    return false;
  }

  console.log('✅ User2 can only see their own images');
  return true;
}

/**
 * Test 4: Cannot Insert for Another User
 */
async function testCannotInsertForOtherUser() {
  console.log('\n📋 Test 4: Cannot Insert Data for Another User');
  console.log('─'.repeat(50));

  // User1 tries to insert feedback with user2's ID
  const { data, error } = await user1Client
    .from('feedback')
    .insert({
      user_id: user2Id, // Trying to insert as user2
      week: 2,  // Note: column is 'week' not 'week_number'
      hydration_rating: 3,
      tone_rating: 3,
      texture_rating: 3,
      overall_rating: 3,
    })
    .select();

  if (!error && data && data.length > 0) {
    console.error('❌ User1 was able to insert feedback for User2!');
    console.error('   This is a security issue!');
    return false;
  }

  console.log('✅ User1 cannot insert feedback for User2');
  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 RLS Policy Testing');
  console.log('='.repeat(50));

  const setupSuccess = await setupTestUsers();
  if (!setupSuccess) {
    console.error('\n❌ Test setup failed');
    process.exit(1);
  }

  const results = {
    profileIsolation: await testProfileIsolation(),
    feedbackIsolation: await testFeedbackIsolation(),
    imageIsolation: await testImageIsolation(),
    cannotInsertForOther: await testCannotInsertForOtherUser(),
  };

  console.log('\n📊 Test Results');
  console.log('='.repeat(50));
  console.log('Profile Isolation:      ', results.profileIsolation ? '✅ PASS' : '❌ FAIL');
  console.log('Feedback Isolation:     ', results.feedbackIsolation ? '✅ PASS' : '❌ FAIL');
  console.log('Image Isolation:        ', results.imageIsolation ? '✅ PASS' : '❌ FAIL');
  console.log('Cannot Insert for Other:', results.cannotInsertForOther ? '✅ PASS' : '❌ FAIL');

  const allPassed = Object.values(results).every(r => r === true);

  if (allPassed) {
    console.log('\n🎉 All RLS tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some RLS tests failed. Please review the policies.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

