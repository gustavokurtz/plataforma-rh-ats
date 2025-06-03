import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O salário deve ser um número válido' })
  @Min(0, { message: 'O salário não pode ser negativo' })
  @Transform(({ value }) => value ? parseFloat(value) : null)
  salary?: number;

  @IsString()
  @IsNotEmpty({ message: 'A localização é obrigatória' })
  location: string;
}

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class JobResponseDto extends OmitType(CreateJobDto, [] as const) {
  id: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}