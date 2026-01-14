const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('.env.local exists');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  
  const keys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  
  keys.forEach(key => {
    const value = envConfig[key];
    if (value) {
      console.log(`${key}: PRESENT (starts with ${value.substring(0, 5)}...)`);
    } else {
      console.log(`${key}: MISSING`);
    }
  });
} else {
  console.log('.env.local does NOT exist');
}


