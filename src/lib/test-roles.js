const { fetchUserRoles } = require('./supabase');

async function testUserRole() {
  const email = 'ashwinproject2024@gmail.com';
  const roles = await fetchUserRoles(email);
  
  if (!roles) {
    console.log('No user found with that email');
    return;
  }

  console.log('User roles:', roles);
}

testUserRole();
