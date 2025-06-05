import { CreateJobDto, UpdateJobDto } from './dto/job-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Candidate, Job, JobApplication } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';


// Defina uma interface/tipo para a estrutura esperada de JobApplication com Candidate e a URL do currículo
// Isso ajuda na tipagem e clareza.
export interface TransformedJobApplication extends Omit<JobApplication, 'candidateResume'> {
  candidate: Omit<Candidate, 'resume'>; // Omitindo 'resume' do Candidate também
  resumeDownloadUrl?: string;
}

export interface TransformedJob extends Job {
  applications: TransformedJobApplication[];
}

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async createJobPosition(createJobDto: CreateJobDto): Promise<Job> {
    try {
      const data = await this.prisma.job.create({
        data: {
          title: createJobDto.title,
          description: createJobDto.description,
          salary: createJobDto.salary,
          location: createJobDto.location,
        },
      });
      return data;
    } catch (error) {
      console.error('Error creating job position:', error);
      throw new Error('Failed to create job position');
    }
  }

  async getJobPositionById(id: number): Promise<TransformedJob | null> {
    try {
      const jobData = await this.prisma.job.findUnique({
        where: { id },
        include: {
          applications: { // Inclui todas as JobApplications relacionadas a esta Job
            include: {
              candidate: true, // Para cada JobApplication, inclui o Candidate associado
            },
          },
        },
      });

      if (!jobData) {
        throw new NotFoundException(`Job position with ID ${id} not found`);
      }

      // Transforma os dados das aplicações para incluir a URL de download do currículo
      // e remover os bytes do currículo da resposta direta.
      const transformedApplications = jobData.applications.map(app => {
        // 'app' aqui é um objeto JobApplication que inclui 'candidate' e 'candidateResume' (os bytes)
        const { candidateResume, ...applicationDataWithoutResumeBytes } = app;
        let resumeDownloadUrl: string | undefined;

        // Verifica se existe o campo candidateResume (que contém os bytes do PDF)
        // Lembre-se que candidateResume está no modelo JobApplication no schema.prisma
        if (candidateResume) {
          // Constrói a URL para o endpoint de download do currículo.
          // Certifique-se que esta rota corresponde ao seu endpoint de download.
          // app.id aqui é o ID da JobApplication.
          resumeDownloadUrl = `/job-application/${app.id}/resume`;
        }
        
        // Remove os bytes do currículo do objeto 'candidate' também, se estiver lá
        // e você não quiser que ele apareça na resposta.
        // No seu schema, 'resume' também está em 'Candidate'.
        const { resume: candidateModelResumeBytes, ...candidateDataWithoutResumeBytes } = app.candidate;

        return {
          ...applicationDataWithoutResumeBytes, // Todos os outros campos da JobApplication
          candidate: candidateDataWithoutResumeBytes, // Dados do candidato sem os bytes do currículo dele
          resumeDownloadUrl: resumeDownloadUrl, // Adiciona a URL de download
        } as TransformedJobApplication; // Faz o type assertion para o tipo que definimos
      });

      return {
        ...jobData, // Todos os outros campos do Job
        applications: transformedApplications, // A lista de applications agora transformada
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching job position by ID:', error);
      throw new Error('Failed to fetch job position by ID');
    }
  }

  async getJobPositions(): Promise<Job[]> { // Considere transformar aqui também se necessário
    try {
      // Se você quiser as URLs de currículo aqui também, precisará de uma lógica de transformação similar
      // à de getJobPositionById, iterando sobre cada job e suas applications.
      // Por simplicidade, este exemplo retorna os dados como estão, o que pode incluir bytes.
      const data = await this.prisma.job.findMany({
        include: {
          applications: {
            include: {
              candidate: true,
            },
          },
        },
      });
      // TODO: Implementar transformação para 'data' aqui se você quiser URLs em vez de bytes
      // para cada currículo em cada aplicação de cada vaga.
      // Exemplo rápido (pode precisar de otimização para muitas vagas/aplicações):
      const transformedJobs = data.map(job => {
        const transformedApplications = job.applications.map(app => {
          const { candidateResume, ...applicationDataWithoutResumeBytes } = app;
          let resumeDownloadUrl: string | undefined;
          if (candidateResume) {
            resumeDownloadUrl = `/job-application/${app.id}/resume`;
          }
          const { resume: candidateModelResumeBytes, ...candidateDataWithoutResumeBytes } = app.candidate;
          return {
            ...applicationDataWithoutResumeBytes,
            candidate: candidateDataWithoutResumeBytes,
            resumeDownloadUrl: resumeDownloadUrl,
          } as TransformedJobApplication;
        });
        return { ...job, applications: transformedApplications };
      });
      return transformedJobs as any; // Use 'any' ou defina um tipo de retorno mais preciso
                                   // como TransformedJob[]
    } catch (error) {
      console.error('Error fetching job positions:', error);
      throw new Error('Failed to fetch job positions');
    }
  }

  async deleteJobPosition(id: number): Promise<Job> {
    try {
      // Considere o que acontece com as JobApplications relacionadas (ex: cascade delete no DB)
      const data = await this.prisma.job.delete({
        where: { id },
      });
      return data;
    } catch (error) {
      // Adicionar checagem para NotFound (P2025 no Prisma)
      if (error.code === 'P2025') {
        throw new NotFoundException(`Job position with ID ${id} not found for deletion.`);
      }
      console.error('Error deleting job position:', error);
      throw new Error('Failed to delete job position');
    }
  }

  async updateJobPosition(id: number, updateData: UpdateJobDto): Promise<Job> {
    try {
      const data = await this.prisma.job.update({
        where: { id },
        data: updateData,
      });
      return data;
    } catch (error) {
      // Adicionar checagem para NotFound (P2025 no Prisma)
      if (error.code === 'P2025') {
        throw new NotFoundException(`Job position with ID ${id} not found for update.`);
      }
      console.error('Error updating job position:', error);
      throw new Error('Failed to update job position');
    }
  }
}