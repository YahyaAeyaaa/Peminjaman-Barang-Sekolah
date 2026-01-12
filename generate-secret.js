// Script untuk generate NEXTAUTH_SECRET
// Jalankan dengan: node generate-secret.js

const crypto = require('crypto');

// Generate random secret dengan 32 bytes (64 karakter hex)
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ NEXTAUTH_SECRET generated:');
console.log('─'.repeat(60));
console.log(secret);
console.log('─'.repeat(60));
console.log('\n📝 Copy secret di atas ke file .env:');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('\n');


