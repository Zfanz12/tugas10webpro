import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('\n=================================================');
  console.log('MENGECEK DATABASE POSTGRESQL (TUGAS 10 - PRISMA)');
  console.log('=================================================');

  try {
    await prisma.$connect();
    console.log('Status Koneksi : TERHUBUNG KE POSTGRESQL');
    console.log('Database       : tugas10_students_103022400076');
    console.log('Tabel          : students\n');

    const students = await prisma.student.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(`Total Data Tersimpan: ${students.length} Mahasiswa\n`);
    console.table(
      students.map((s) => ({
        ID: s.id,
        NIM: s.nim,
        Nama: s.nama,
        Jurusan: s.jurusan,
        Angkatan: s.angkatan,
        IPK: s.ipk,
        Status: s.status,
      })),
    );
    console.log('=================================================\n');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

check();
