# LAPORAN TUGAS 10 - PEMROGRAMAN WEB
**BAB 10 - Implementasi REST API + PostgreSQL + ORM (Prisma)**

---

### **Identitas Mahasiswa**
- **Nama** : Zulfan Falah Permana
- **NIM** : 103022400076
- **Mata Kuliah** : Pemrograman Web (Webpro)
- **Topik Tugas** : Tugas 10 - Integrasi REST API NestJS dengan PostgreSQL & Prisma ORM (CRUD Permanen + Query Lanjutan)

---

## 1. Penyiapan Server PostgreSQL & Basis Data

Server **PostgreSQL 18** lokal (`postgresql-x64-18`) berjalan aktif pada `localhost:5432`. Basis data khusus untuk Tugas 10 dibuat dengan nama:

- **Nama Database** : `tugas10_students_103022400076`
- **Konfigurasi `.env`** :
  ```env
  DATABASE_URL="postgresql://postgres:12345678@localhost:5432/tugas10_students_103022400076?schema=public"
  PORT=3000
  ```

---

## 2. Perancangan Model Prisma (`prisma/schema.prisma`)

Melanjutkan entitas utama **Student** dari Tugas 09, model diperkaya dengan field `ipk` (`Float`) serta enum `StatusMahasiswa` (`AKTIF`, `CUTI`, `LULUS`) pada `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum StatusMahasiswa {
  AKTIF
  CUTI
  LULUS
}

model Student {
  id        Int             @id @default(autoincrement())
  nim       String          @unique
  nama      String
  email     String          @unique
  jurusan   String
  angkatan  Int
  ipk       Float           @default(0.0)
  status    StatusMahasiswa @default(AKTIF)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@map("students")
}
```

---

## 3. Migrasi Awal (`npx prisma migrate dev`) & Seeding Data

Migrasi awal dijalankan menggunakan perintah:
```bash
npx prisma migrate dev --name init
```

Perintah tersebut menghasilkan berkas migrasi `prisma/migrations/20261125163535_init/migration.sql`:
```sql
CREATE TYPE "StatusMahasiswa" AS ENUM ('AKTIF', 'CUTI', 'LULUS');

CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "ipk" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "StatusMahasiswa" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "students_nim_key" ON "students"("nim");
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");
```

Verifikasi pada PostgreSQL (`\dt` dan `\d students`) memastikan tabel `_prisma_migrations` dan `students` telah terbentuk dengan constraint `PRIMARY KEY` dan `UNIQUE INDEX` pada `nim` serta `email`. Data awal sebanyak 5 mahasiswa juga di-seed melalui `node prisma/seed.mjs`.

---

## 4. `PrismaService` sebagai Provider & Keterhubungan Komponen

Arsitektur tetap menjaga pemisahan tanggung jawab (*Separation of Concerns*) antara Controller dan lapisan data:

1. **`PrismaService` (`src/prisma/prisma.service.ts`)** & **`PrismaModule` (`src/prisma/prisma.module.ts`)**:
   - `PrismaService` mewarisi `PrismaClient` serta mengimplementasikan `OnModuleInit` (`$connect()`) dan `OnModuleDestroy` (`$disconnect()`).
   - `PrismaModule` diberi dekorator `@Global()` agar `PrismaService` dapat diinjeksikan ke seluruh modul aplikasi.
2. **`StudentsService` (`src/students/students.service.ts`)**:
   - Menginjeksikan `PrismaService` melalui constructor (`private readonly prisma: PrismaService`) untuk seluruh operasi database melalui Prisma Client (menggantikan penyimpanan in-memory/array).
3. **`StudentsController` (`src/students/students.controller.ts`)**:
   - Hanya bergantung pada `StudentsService` (tidak mengakses Prisma secara langsung) dan menangani routing HTTP serta format respons JSON.

---

## 5. Endpoint CRUD Permanen & Pengujian Persistensi Restart Server

Seluruh operasi CRUD tersedia di bawah prefix `/students` dengan validasi DTO (`ValidationPipe` global):

| Operasi | Method & Path | Fungsi Prisma Client | Status Uji |
| :--- | :--- | :--- | :--- |
| **Create** | `POST /students` | `prisma.student.create()` | `201 Created` (duplikat `409`, input invalid `400`) |
| **Read All** | `GET /students` | `prisma.student.findMany()` | `200 OK` |
| **Read One** | `GET /students/:id` | `prisma.student.findUnique()` | `200 OK` (tidak ditemukan `404`) |
| **Update** | `PATCH /students/:id` / `PUT /students/:id` | `prisma.student.update()` | `200 OK` |
| **Delete** | `DELETE /students/:id` | `prisma.student.delete()` | `200 OK` |

### Bukti Pengujian Persistensi Setelah Restart Server
1. Server dijalankan (`node dist/main.js`) → dibuat data baru (`POST /students`, `id = 6`, NIM `103022400199`) → diperbarui (`PATCH /students/6` menjadi `jurusan = "S1 Informatika"`, `ipk = 3.92`).
2. Proses server pertama dihentikan sepenuhnya (port `3000` tertutup).
3. Proses server kedua dinyalakan kembali (`node dist/main.js`).
4. Request `GET /students/6` tetap mengembalikan `200 OK` dengan `jurusan: "S1 Informatika"` dan `ipk: 3.92` langsung dari PostgreSQL.
5. Setelah itu `DELETE /students/6` mengembalikan `200 OK`, dan `GET /students/6` mengembalikan `404 Not Found`.

---

## 6. (Opsional / Nilai Tambah) Endpoint Query Lanjutan (`where`, `count`, `groupBy`, `aggregate`)

Ditambahkan dua kapabilitas query lanjutan pada `StudentsController` (ditempatkan sebelum route dinamis `@Get(':id')`):

1. **Filter Lanjutan (`GET /students/filter` & query parameter pada `GET /students`)**:
   - Mendukung parameter `?search=`, `?jurusan=`, `?angkatan=`, `?status=`, dan `?minIpk=`.
   - Menggunakan Prisma `where` dengan `contains` (`mode: 'insensitive'`), pencocokan tepat untuk `angkatan`/`status`, serta `gte` pada `ipk`.
   - Pengujian `GET /students/filter?jurusan=Rekayasa&minIpk=3.6` mengembalikan `200 OK` dengan 2 mahasiswa yang sesuai.
2. **Statistik Mahasiswa (`GET /students/stats`)**:
   - Menggunakan `prisma.student.count()`, `prisma.student.aggregate()` (rata-rata, nilai tertinggi, dan terendah IPK), serta `prisma.student.groupBy()` berdasarkan `jurusan`, `angkatan`, dan `status`.

---

## 7. Panduan Menjalankan Proyek

```bash
# 1. Install dependensi
npm install

# 2. Jalankan migrasi database
npx prisma migrate dev

# 3. Isi data awal (opsional)
npm run prisma:seed

# 4. Build & jalankan server
npm run build
npm run start:prod

# 5. Cek isi database lewat CLI atau Prisma Studio
npm run db:check
npm run prisma:studio
```

Koleksi pengujian juga tersedia pada file `students.http` (REST Client) dan `postman_collection.json` (Postman v2.1).
