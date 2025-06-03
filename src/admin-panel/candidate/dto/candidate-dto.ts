import { IsString, IsEmail, IsOptional, IsNotEmpty, IsUrl } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string válida' })
  phone?: string;

  @IsOptional()
  @IsUrl({}, { message: 'O currículo deve ser uma URL válida' })
  resume?: string;
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}

export class CandidateResponseDto extends OmitType(CreateCandidateDto, [] as const) {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  applications: any[]; // Podemos criar um tipo específico para as applications depois
}