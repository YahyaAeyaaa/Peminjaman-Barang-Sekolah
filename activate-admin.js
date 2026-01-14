// Script untuk mengaktifkan akun admin
// Jalankan: node activate-admin.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Mengaktifkan akun admin...');
  console.log('');

  try {
    // Update admin menjadi aktif
    const admin = await prisma.user.updateMany({
      where: {
        email: 'admin@example.com',
        role: 'ADMIN',
      },
      data: {
        is_active: true,
      },
    });

    if (admin.count > 0) {
      console.log('✅ Akun admin berhasil diaktifkan!');
      console.log('');
      console.log('📝 Sekarang kamu bisa login dengan:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      console.log('❌ Akun admin tidak ditemukan');
      console.log('   Pastikan email: admin@example.com ada di database');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



