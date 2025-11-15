/**
 * RLS Policy Diagnostic Script
 * 
 * This script checks if RLS is enabled and policies are correctly configured.
 * Run with: node scripts/diagnose-rls.js
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
  process.exit(1);
}

// Create admin client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log('🔍 RLS Policy Diagnostic');
  console.log('='.repeat(50));

  // Check if RLS is enabled on tables
  console.log('\n📋 Checking RLS Status on Tables...\n');

  const tables = ['profiles', 'feedback', 'images'];

  for (const table of tables) {
    try {
      // Query to check if RLS is enabled
      const { data, error } = await adminClient.rpc('exec_sql', {
        query: `
          SELECT 
            tablename,
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename = $1
              ) THEN (
                SELECT relrowsecurity 
                FROM pg_class 
                WHERE relname = $1
              )
              ELSE NULL
            END as rls_enabled
          FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = $1;
        `,
        params: [table]
      });

      // Alternative: Try to query pg_class directly
      const { data: rlsData, error: rlsError } = await adminClient
        .from('pg_class')
        .select('relname, relrowsecurity')
        .eq('relname', table)
        .single();

      if (rlsError) {
        // Try a different approach - check policies
        const { data: policies, error: policyError } = await adminClient
          .from('pg_policies')
          .select('*')
          .eq('tablename', table);

        if (policyError) {
          console.log(`⚠️  ${table}: Cannot check RLS status (may need SQL query)`);
        } else {
          const hasPolicies = policies && policies.length > 0;
          console.log(`   ${table}: ${hasPolicies ? '✅ Has policies' : '❌ No policies found'}`);
          if (hasPolicies) {
            policies.forEach(p => {
              console.log(`      - ${p.policyname} (${p.cmd})`);
            });
          }
        }
      } else {
        const isEnabled = rlsData?.relrowsecurity;
        console.log(`   ${table}: ${isEnabled ? '✅ RLS Enabled' : '❌ RLS Disabled'}`);
      }
    } catch (error) {
      console.log(`   ${table}: ⚠️  Could not check (${error.message})`);
    }
  }

  // Check existing data
  console.log('\n📊 Checking Existing Data...\n');

  for (const table of tables) {
    try {
      const { data, error, count } = await adminClient
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ${table}: ❌ Error: ${error.message}`);
      } else {
        console.log(`   ${table}: ${count || 0} rows`);
      }
    } catch (error) {
      console.log(`   ${table}: ⚠️  Could not check (${error.message})`);
    }
  }

  console.log('\n💡 Recommendations:');
  console.log('   1. If RLS is disabled, run the schema.sql file in Supabase SQL Editor');
  console.log('   2. If policies are missing, check supabase/schema.sql for policy definitions');
  console.log('   3. Verify policies use: USING (auth.uid() = user_id)');
  console.log('   4. Check Supabase Dashboard → Authentication → Policies');
}

checkRLSStatus().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});




