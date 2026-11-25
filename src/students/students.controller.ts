import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentsService } from './students.service.js';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(@Query() filter: FilterStudentDto) {
    const data = await this.studentsService.findAll(filter);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil daftar data mahasiswa',
      total: data.length,
      data,
    };
  }

  @Get('filter')
  async filterStudents(@Query() filter: FilterStudentDto) {
    const data = await this.studentsService.findAll(filter);
    return {
      statusCode: 200,
      message: 'Berhasil memfilter data mahasiswa',
      filter,
      total: data.length,
      data,
    };
  }

  @Get('stats')
  async getStats() {
    const data = await this.studentsService.getStatistics();
    return {
      statusCode: 200,
      message: 'Berhasil mengambil statistik data mahasiswa',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.studentsService.findOne(id);
    return {
      statusCode: 200,
      message: `Berhasil mengambil data mahasiswa ID ${id}`,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateStudentDto) {
    const data = await this.studentsService.create(dto);
    return {
      statusCode: 201,
      message: 'Mahasiswa berhasil ditambahkan',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    const data = await this.studentsService.update(id, dto);
    return {
      statusCode: 200,
      message: `Data mahasiswa ID ${id} berhasil diperbarui`,
      data,
    };
  }

  @Put(':id')
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    const data = await this.studentsService.update(id, dto);
    return {
      statusCode: 200,
      message: `Data mahasiswa ID ${id} berhasil diperbarui`,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.studentsService.remove(id);
    return {
      statusCode: 200,
      message: `Data mahasiswa ID ${id} berhasil dihapus`,
      data,
    };
  }
}
