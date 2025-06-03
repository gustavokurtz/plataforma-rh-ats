import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/job-application-dto';

@Injectable()
export class JobapplicationService {
    constructor(private readonly prisma: PrismaService) {}

    async createJobApplication(createJobApplication: CreateJobApplicationDto) {
        try {
            // Primeiro, verifica se a vaga existe e está ativa
            const job = await this.prisma.job.findUnique({
                where: { id: createJobApplication.jobId }
            });

            if (!job) {
                throw new NotFoundException('Vaga não encontrada');
            }

            if (!job.isActive) {
                throw new ConflictException('Esta vaga não está mais aceitando candidaturas');
            }

            // Procura ou cria o candidato
            const candidate = await this.prisma.candidate.upsert({
                where: { email: createJobApplication.candidateEmail },
                update: {
                    name: createJobApplication.candidateName,
                    phone: createJobApplication.candidatePhone,
                    resume: createJobApplication.candidateResume,
                },
                create: {
                    name: createJobApplication.candidateName,
                    email: createJobApplication.candidateEmail,
                    phone: createJobApplication.candidatePhone,
                    resume: createJobApplication.candidateResume,
                },
            });

            // Cria a aplicação vinculando o candidato e a vaga
            const data = await this.prisma.jobApplication.create({
                data: {
                    jobId: createJobApplication.jobId,
                    candidateId: candidate.id,
                    candidateName: createJobApplication.candidateName,
                    candidateEmail: createJobApplication.candidateEmail,
                    candidatePhone: createJobApplication.candidatePhone,
                    candidateResume: createJobApplication.candidateResume,
                },
                include: {
                    job: true,
                    candidate: true
                }
            });

            return data;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error('Error creating job application:', error);
            throw new Error('Failed to create job application');
        }
    }
}
