import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private handleUniqueError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Mahasiswa dengan NIM atau email tersebut sudah terdaftar',
      );
    }
    throw error;
  }

  async findAll(filter: FilterStudentDto = {}) {
    const where: Prisma.StudentWhereInput = {};

    if (filter.search) {
      where.OR = [
        { nama: { contains: filter.search, mode: 'insensitive' } },
        { nim: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.jurusan) {
      where.jurusan = { contains: filter.jurusan, mode: 'insensitive' };
    }

    if (filter.angkatan !== undefined) {
      where.angkatan = filter.angkatan;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.minIpk !== undefined) {
      where.ipk = { gte: filter.minIpk };
    }

    return this.prisma.student.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Mahasiswa dengan ID ${id} tidak ditemukan`);
    }

    return student;
  }

  async create(dto: CreateStudentDto) {
    try {
      return await this.prisma.student.create({
        data: dto,
      });
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.findOne(id);

    try {
      return await this.prisma.student.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handleUniqueError(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.student.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [totalMahasiswa, ipkAggregate, byJurusan, byAngkatan, byStatus] =
      await Promise.all([
        this.prisma.student.count(),
        this.prisma.student.aggregate({
          _avg: { ipk: true },
          _max: { ipk: true },
          _min: { ipk: true },
        }),
        this.prisma.student.groupBy({
          by: ['jurusan'],
          _count: { id: true },
          _avg: { ipk: true },
          orderBy: { jurusan: 'asc' },
        }),
        this.prisma.student.groupBy({
          by: ['angkatan'],
          _count: { id: true },
          orderBy: { angkatan: 'asc' },
        }),
        this.prisma.student.groupBy({
          by: ['status'],
          _count: { id: true },
          orderBy: { status: 'asc' },
        }),
      ]);

    return {
      totalMahasiswa,
      ringkasanIpk: {
        rataRata:
          ipkAggregate._avg.ipk !== null
            ? Number(ipkAggregate._avg.ipk.toFixed(2))
            : 0,
        tertinggi: ipkAggregate._max.ipk ?? 0,
        terendah: ipkAggregate._min.ipk ?? 0,
      },
      perJurusan: byJurusan.map((item) => ({
        jurusan: item.jurusan,
        jumlah: item._count.id,
        rataRataIpk:
          item._avg.ipk !== null ? Number(item._avg.ipk.toFixed(2)) : 0,
      })),
      perAngkatan: byAngkatan.map((item) => ({
        angkatan: item.angkatan,
        jumlah: item._count.id,
      })),
      perStatus: byStatus.map((item) => ({
        status: item.status,
        jumlah: item._count.id,
      })),
    };
  }
}
