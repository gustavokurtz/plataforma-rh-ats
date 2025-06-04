import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/job-application-dto';
import { Prisma } from 'generated/prisma';


@Injectable()
export class JobapplicationService {
    constructor(private readonly prisma: PrismaService) {}

    async createJobApplication(
        createJobApplicationDto: CreateJobApplicationDto,
        resumeBuffer?: Buffer, // Adiciona o buffer do currículo como parâmetro
    ) {
        try {
            const job = await this.prisma.job.findUnique({
                where: { id: createJobApplicationDto.jobId }
            });

            if (!job) {
                throw new NotFoundException('Vaga não encontrada');
            }

            if (!job.isActive) {
                throw new ConflictException('Esta vaga não está mais aceitando candidaturas');
            }

            // Prepara os dados do candidato, incluindo o currículo como Buffer
            const candidateDataCreate: Prisma.CandidateCreateInput = {
                name: createJobApplicationDto.candidateName,
                email: createJobApplicationDto.candidateEmail,
                phone: createJobApplicationDto.candidatePhone,
                resume: resumeBuffer, // Salva o buffer do PDF
            };

            const candidateDataUpdate: Prisma.CandidateUpdateInput = {
                name: createJobApplicationDto.candidateName,
                phone: createJobApplicationDto.candidatePhone,
                resume: resumeBuffer, // Salva o buffer do PDF
            };
            
            const candidate = await this.prisma.candidate.upsert({
                where: { email: createJobApplicationDto.candidateEmail },
                update: candidateDataUpdate,
                create: candidateDataCreate,
            });

            const applicationData: Prisma.JobApplicationCreateInput = {
                job: { connect: { id: createJobApplicationDto.jobId } },
                candidate: { connect: { id: candidate.id } },
                candidateName: createJobApplicationDto.candidateName,
                candidateEmail: createJobApplicationDto.candidateEmail,
                candidatePhone: createJobApplicationDto.candidatePhone,
                candidateResume: resumeBuffer, // Salva o buffer do PDF também na aplicação
            };

            const data = await this.prisma.jobApplication.create({
                data: applicationData,
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
            // Log detalhado do erro para depuração
            console.error('Error creating job application:', error.message, error.stack);
            // Se for um erro do Prisma conhecido (ex: violação de constraint)
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                 // Exemplo: P2002 é unique constraint violation
                if (error.code === 'P2002') {
                    throw new ConflictException('Já existe uma candidatura para este candidato nesta vaga.');
                }
            }
            throw new Error('Falha ao criar a candidatura.');
        }
    }

    async getResumeByApplicationId(applicationId: number): Promise<{ resumeBuffer: Buffer, candidateName: string } | null> {
    const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
        select: {
            candidateResume: true,
            candidateName: true,
        },
    });

    if (!application || !application.candidateResume) {
        return null;
    }

    // Converta para Buffer aqui
    const resumeBuffer = Buffer.from(application.candidateResume);

    return {
        resumeBuffer: resumeBuffer, // Agora é um Buffer
        candidateName: application.candidateName
     };
    } 
}