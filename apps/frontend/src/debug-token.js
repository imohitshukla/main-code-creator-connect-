// 🚨 EMERGENCY TOKEN DEBUG - Run this in browser console
console.log('=== EMERGENCY TOKEN DEBUG ===');

// Check localStorage
const localToken = localStorage.getItem('auth_token');
console.log('🔍 localStorage token:', localToken);
console.log('🔍 localStorage contents:', JSON.stringify(localStorage));

// Check cookies
console.log('🔍 All cookies:', document.cookie);
console.log('🔍 Cookie count:', document.cookie.split(';').length);

// Test token manually
if (localToken) {
  try {
    const tokenParts = localToken.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('✅ Token is valid JWT:', payload);
    } else {
      console.log('❌ Token is not valid JWT format');
    }
  } catch (error) {
    console.log('❌ Token decode failed:', error);
  }
} else {
  console.log('❌ No token found in localStorage');
}

// Test manual API call
fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': localToken ? `Bearer ${localToken}` : 'NO_TOKEN'
  },
  credentials: 'include'
}).then(res => {
  console.log('🔍 Manual API test - Status:', res.status);
  console.log('🔍 Manual API test - Headers:', {
    'set-cookie': res.headers.get('set-cookie'),
    'access-control-allow-credentials': res.headers.get('access-control-allow-credentials'),
    'access-control-allow-origin': res.headers.get('access-control-allow-origin')
  });
  return res.json();
}).then(data => {
  console.log('🔍 Manual API test - Response:', data);
}).catch(error => {
  console.log('❌ Manual API test - Error:', error);
});

console.log('=== END EMERGENCY DEBUG ===');
