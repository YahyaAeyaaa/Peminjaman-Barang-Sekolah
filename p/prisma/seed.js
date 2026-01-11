const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Hash password default
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      nama: 'Administrator',
      email: 'admin@example.com'
    }
  })
  console.log('✅ Admin created:', admin.username)

  // Create Petugas
  const petugas = await prisma.user.upsert({
    where: { username: 'petugas' },
    update: {},
    create: {
      username: 'petugas',
      password: hashedPassword,
      role: 'PETUGAS',
      nama: 'Petugas 1',
      email: 'petugas@example.com'
    }
  })
  console.log('✅ Petugas created:', petugas.username)

  // Create Peminjam
  const peminjam = await prisma.user.upsert({
    where: { username: 'peminjam' },
    update: {},
    create: {
      username: 'peminjam',
      password: hashedPassword,
      role: 'PEMINJAM',
      nama: 'Peminjam 1',
      email: 'peminjam@example.com'
    }
  })
  console.log('✅ Peminjam created:', peminjam.username)

  // Create Categories
  const kategori1 = await prisma.category.upsert({
    where: { nama: 'Elektronik' },
    update: {},
    create: {
      nama: 'Elektronik',
      deskripsi: 'Alat-alat elektronik'
    }
  })
  console.log('✅ Category created:', kategori1.nama)

  const kategori2 = await prisma.category.upsert({
    where: { nama: 'Perkakas' },
    update: {},
    create: {
      nama: 'Perkakas',
      deskripsi: 'Alat-alat perkakas'
    }
  })
  console.log('✅ Category created:', kategori2.nama)

  // Create Sample Equipment
  const equipment1 = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nama: 'Laptop Dell',
      kategori_id: kategori1.id,
      stok: 5,
      status: 'AVAILABLE',
      deskripsi: 'Laptop Dell untuk presentasi'
    }
  })
  console.log('✅ Equipment created:', equipment1.nama)

  const equipment2 = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nama: 'Bor Listrik',
      kategori_id: kategori2.id,
      stok: 3,
      status: 'AVAILABLE',
      deskripsi: 'Bor listrik untuk proyek'
    }
  })
  console.log('✅ Equipment created:', equipment2.nama)

  console.log('🎉 Seeding completed!')
  console.log('\n📝 Default credentials:')
  console.log('   Admin:   username=admin, password=admin123')
  console.log('   Petugas: username=petugas, password=admin123')
  console.log('   Peminjam: username=peminjam, password=admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

