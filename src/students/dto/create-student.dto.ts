import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  nim: string;

  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  jurusan: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  angkatan: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  ipk?: number;

  @IsOptional()
  @IsIn(['AKTIF', 'CUTI', 'LULUS'])
  status?: 'AKTIF' | 'CUTI' | 'LULUS';
}
