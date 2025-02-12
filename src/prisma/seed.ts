import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedAdminPassword = await bcrypt.hash('superadmin', 10);

  // Tambah Admin
  await prisma.admin.create({
    data: {
      email: 'superadmin',
      password: hashedAdminPassword,
    },
  });

  // Tambah Siswa
  // await prisma.siswa.create({
  //   data: {
  //     nama: 'ADITHYA SUNANTA',
  //     spCount: 0,
  //     kelas: '7A',
  //   },
  // });

  console.log('Admin berhasil ditambahkan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
