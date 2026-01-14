const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

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

  // Create Categories (untuk RPL)
  const kategori1 = await prisma.category.upsert({
    where: { nama: 'VGA' },
    update: {},
    create: {
      nama: 'VGA',
      deskripsi: 'Kartu grafis untuk rendering dan gaming'
    }
  })
  console.log('✅ Category created:', kategori1.nama)

  const kategori2 = await prisma.category.upsert({
    where: { nama: 'RAM' },
    update: {},
    create: {
      nama: 'RAM',
      deskripsi: 'Memory RAM untuk komputer'
    }
  })
  console.log('✅ Category created:', kategori2.nama)

  const kategori3 = await prisma.category.upsert({
    where: { nama: 'Processor' },
    update: {},
    create: {
      nama: 'Processor',
      deskripsi: 'CPU untuk komputer'
    }
  })
  console.log('✅ Category created:', kategori3.nama)

  const kategori4 = await prisma.category.upsert({
    where: { nama: 'SSD' },
    update: {},
    create: {
      nama: 'SSD',
      deskripsi: 'Solid State Drive untuk storage'
    }
  })
  console.log('✅ Category created:', kategori4.nama)

  // Create Sample Equipment (untuk RPL)
  const equipment1 = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nama: 'RTX 4090',
      kategori_id: kategori1.id,
      stok: 2,
      status: 'AVAILABLE',
      deskripsi: 'NVIDIA RTX 4090 24GB GDDR6X'
    }
  })
  console.log('✅ Equipment created:', equipment1.nama)

  const equipment2 = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      nama: 'RTX 2050',
      kategori_id: kategori1.id,
      stok: 3,
      status: 'AVAILABLE',
      deskripsi: 'NVIDIA RTX 2050 4GB GDDR6'
    }
  })
  console.log('✅ Equipment created:', equipment2.nama)

  const equipment3 = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      nama: 'DDR4 16GB',
      kategori_id: kategori2.id,
      stok: 5,
      status: 'AVAILABLE',
      deskripsi: 'RAM DDR4 16GB 3200MHz'
    }
  })
  console.log('✅ Equipment created:', equipment3.nama)

  const equipment4 = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      nama: 'Intel i7-13700K',
      kategori_id: kategori3.id,
      stok: 2,
      status: 'AVAILABLE',
      deskripsi: 'Intel Core i7-13700K Processor'
    }
  })
  console.log('✅ Equipment created:', equipment4.nama)

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

