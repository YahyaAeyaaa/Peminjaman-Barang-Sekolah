// Script untuk generate SQL query create admin
// Jalankan: node create-admin.js
// Lalu copy SQL query yang dihasilkan dan jalankan di PostgreSQL

const bcrypt = require('bcryptjs')

async function main() {
  console.log('🔧 Generating SQL query untuk create admin...')
  console.log('')
  
  const hash = await bcrypt.hash('admin123', 10)
  
  console.log('📝 Copy dan jalankan query berikut di PostgreSQL:')
  console.log('')
  console.log(`INSERT INTO users (id, email, password, role, first_name, last_name, is_active, created_at, updated_at)`)
  console.log(`VALUES (gen_random_uuid(), 'admin@example.com', '${hash}', 'ADMIN', 'Admin', 'Sistem', true, NOW(), NOW());`)
  console.log('')
  console.log('✅ Setelah query dijalankan, kamu bisa login dengan:')
  console.log('   Email: admin@example.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('---')
  console.log('')
  console.log('Atau gunakan API endpoint (setelah server jalan):')
  console.log('POST http://localhost:3000/api/admin/create-admin')
  console.log('Body: {')
  console.log('  "email": "admin@example.com",')
  console.log('  "password": "admin123",')
  console.log('  "first_name": "Admin",')
  console.log('  "last_name": "Sistem"')
  console.log('}')
}

main().catch(console.error)
