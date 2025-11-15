/**
 * Test API response standardization
 * This script tests that API routes return the standardized format
 */

const API_ROUTES = [
  '/api/ingredients?skinType=normal&concerns=dark_spots',
  // Note: Other routes require authentication, so we'll test the public one
];

async function testApiRoute(url) {
  try {
    const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${url}`;
    
    console.log(`\n📡 Testing: ${url}`);
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    // Check for standardized format
    const hasSuccess = 'success' in data;
    const hasData = 'data' in data || 'error' in data;
    
    if (hasSuccess && hasData) {
      console.log(`  ✅ Standardized format detected`);
      console.log(`     Success: ${data.success}`);
      if (data.success) {
        console.log(`     Data type: ${Array.isArray(data.data) ? 'array' : typeof data.data}`);
        if (data.message) {
          console.log(`     Message: ${data.message}`);
        }
      } else {
        console.log(`     Error: ${data.error}`);
        if (data.code) {
          console.log(`     Code: ${data.code}`);
        }
      }
      return true;
    } else {
      console.log(`  ❌ Non-standard format`);
      console.log(`     Keys: ${Object.keys(data).join(', ')}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing API Response Standardization\n');
  console.log('⚠️  Make sure the dev server is running: npm run dev\n');
  
  const results = [];
  
  for (const route of API_ROUTES) {
    const passed = await testApiRoute(route);
    results.push({ route, passed });
  }
  
  console.log('\n📊 Results:');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`   Passed: ${passedCount}/${totalCount}`);
  
  if (passedCount === totalCount) {
    console.log('\n✅ All API routes use standardized format!');
    process.exit(0);
  } else {
    console.log('\n❌ Some routes need standardization');
    process.exit(1);
  }
}

main().catch(console.error);

