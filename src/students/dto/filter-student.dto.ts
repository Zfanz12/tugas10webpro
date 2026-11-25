import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FilterStudentDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  jurusan?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  angkatan?: number;

  @IsOptional()
  @IsIn(['AKTIF', 'CUTI', 'LULUS'])
  status?: 'AKTIF' | 'CUTI' | 'LULUS';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  minIpk?: number;
}
