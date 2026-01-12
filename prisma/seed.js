const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Hash password default
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      first_name: 'Admin',
      last_name: 'Sistem',
      kelas: null,
      no_hp: null,
      alamat: null
    }
  })
  console.log('✅ Admin created:', admin.email)

  // Create Petugas
  const petugas = await prisma.user.upsert({
    where: { email: 'petugas@example.com' },
    update: {},
    create: {
      username: 'petugas',
      email: 'petugas@example.com',
      password: hashedPassword,
      role: 'PETUGAS',
      first_name: 'Petugas',
      last_name: 'Satu',
      kelas: null,
      no_hp: null,
      alamat: null
    }
  })
  console.log('✅ Petugas created:', petugas.email)

  // Create Peminjam
  const peminjam = await prisma.user.upsert({
    where: { email: 'peminjam@example.com' },
    update: {},
    create: {
      username: 'peminjam',
      email: 'peminjam@example.com',
      password: hashedPassword,
      role: 'PEMINJAM',
      first_name: 'Peminjam',
      last_name: 'Satu',
      kelas: 'X-1 A',
      no_hp: null,
      alamat: null
    }
  })
  console.log('✅ Peminjam created:', peminjam.email)

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
  console.log('\n📝 Default credentials (Login dengan Email + Password):')
  console.log('   Admin:   email=admin@example.com, password=admin123')
  console.log('   Petugas: email=petugas@example.com, password=admin123')
  console.log('   Peminjam: email=peminjam@example.com, password=admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

