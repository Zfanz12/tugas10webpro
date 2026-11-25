import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding student data for Tugas 10...');

  const students = [
    {
      nim: '103022400076',
      nama: 'Zulfan Falah Permana',
      email: 'zulfan@student.telkomuniversity.ac.id',
      jurusan: 'S1 Rekayasa Perangkat Lunak',
      angkatan: 2024,
      ipk: 3.85,
      status: 'AKTIF',
    },
    {
      nim: '103022400012',
      nama: 'Adinda Maharani',
      email: 'adinda@student.telkomuniversity.ac.id',
      jurusan: 'S1 Rekayasa Perangkat Lunak',
      angkatan: 2024,
      ipk: 3.72,
      status: 'AKTIF',
    },
    {
      nim: '103022300035',
      nama: 'Budi Santoso',
      email: 'budisantoso@student.telkomuniversity.ac.id',
      jurusan: 'S1 Informatika',
      angkatan: 2023,
      ipk: 3.55,
      status: 'CUTI',
    },
    {
      nim: '103022200054',
      nama: 'Siti Nurhaliza',
      email: 'sitinur@student.telkomuniversity.ac.id',
      jurusan: 'S1 Sistem Informasi',
      angkatan: 2022,
      ipk: 3.68,
      status: 'LULUS',
    },
    {
      nim: '103022400088',
      nama: 'Rizky Ramadhan',
      email: 'rizkyramadhan@student.telkomuniversity.ac.id',
      jurusan: 'S1 Rekayasa Perangkat Lunak',
      angkatan: 2024,
      ipk: 3.4,
      status: 'AKTIF',
    },
  ];

  for (const s of students) {
    await prisma.student.upsert({
      where: { nim: s.nim },
      update: s,
      create: s,
    });
  }

  console.log(`Seeding selesai! Total: ${students.length} mahasiswa.`);
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
