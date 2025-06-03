import { IsString, IsEmail, IsOptional, IsNotEmpty, IsNumber, IsUrl } from 'class-validator';
import { ApplicationStatus } from '../../../../generated/prisma';

export class CreateJobApplicationDto {
  @IsNumber()
  @IsNotEmpty({ message: 'O ID da vaga é obrigatório' })
  jobId: number;

  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  candidateName: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  candidateEmail: string;

  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string válida' })
  candidatePhone?: string;

  @IsOptional()
  @IsUrl({}, { message: 'O currículo deve ser uma URL válida' })
  candidateResume?: string;
}

export class UpdateJobApplicationDto {
  @IsOptional()
  status?: ApplicationStatus;
}

export interface JobApplicationResponseDto {
  id: number;
  jobId: number;
  candidateId: number;
  status: ApplicationStatus;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateResume?: string;
  appliedAt: Date;
  updatedAt: Date;
}