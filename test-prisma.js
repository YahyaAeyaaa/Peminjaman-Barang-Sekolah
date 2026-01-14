// Test script untuk cek Prisma dan password
const bcrypt = require('bcryptjs')

async function test() {
  console.log('🔍 Testing Prisma connection...')
  
  try {
    // Test import Prisma
    const { PrismaClient } = require('@prisma/client')
    console.log('✅ PrismaClient imported')
    
    const prisma = new PrismaClient({})
    console.log('✅ PrismaClient instance created')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test query - cek admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (admin) {
      console.log('✅ Admin user found:', admin.email)
      console.log('   Role:', admin.role)
      console.log('   Is Active:', admin.is_active)
      
      // Test password
      const testPassword = 'admin123'
      const isMatch = await bcrypt.compare(testPassword, admin.password)
      console.log('   Password match:', isMatch)
      
      if (!isMatch) {
        console.log('')
        console.log('❌ PASSWORD TIDAK COCOK!')
        console.log('   Hash di database:', admin.password.substring(0, 30) + '...')
        console.log('')
        console.log('   Generate hash baru untuk "admin123":')
        const newHash = await bcrypt.hash('admin123', 10)
        console.log('   UPDATE users SET password = \'' + newHash + '\' WHERE email = \'admin@example.com\';')
      }
    } else {
      console.log('❌ Admin user NOT FOUND!')
      console.log('   Run: node create-admin.js untuk generate SQL')
    }
    
    await prisma.$disconnect()
    console.log('✅ Disconnected')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('   Stack:', error.stack)
  }
}

test()

