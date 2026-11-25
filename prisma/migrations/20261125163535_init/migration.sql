-- CreateEnum
CREATE TYPE "StatusMahasiswa" AS ENUM ('AKTIF', 'CUTI', 'LULUS');

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "students_nim_key" ON "students"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");
