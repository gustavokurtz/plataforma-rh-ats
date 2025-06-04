import {
  Body, Controller, Post, UploadedFile, UseInterceptors,
  ParseFilePipe, FileTypeValidator, Get, Param, Res, // Adicione Get, Param, Res
  NotFoundException, ParseIntPipe // Adicione NotFoundException, ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobapplicationService } from './jobapplication.service';
import { CreateJobApplicationDto, JobApplicationResponseDto } from './dto/job-application-dto';
import { Express, Response } from 'express'; // Importe Response de express

@Controller('job-application') // Se sua API tiver um prefixo global como /api, a URL final será /api/job-application
export class JobapplicationController {
  constructor(private readonly jobapplicationService: JobapplicationService) {}

  @Post()
  @UseInterceptors(FileInterceptor('resumeFile'))
  async createJobApplication(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
        fileIsRequired: false,
      }),
    ) resumeFile?: Express.Multer.File,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobapplicationService.createJobApplication(
      createJobApplicationDto,
      resumeFile?.buffer,
    );
    
    return {
      id: application.id,
      jobId: application.jobId,
      candidateId: application.candidateId,
      status: application.status,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      candidatePhone: application.candidatePhone || undefined,
      // Gera a URL se o currículo (candidateResume) existir no objeto 'application' retornado pelo serviço
      // O objeto 'application' aqui é o retorno do Prisma, que tem o campo candidateResume com os Bytes
      resumeDownloadUrl: application.candidateResume 
        ? `/job-application/${application.id}/resume` // Ajuste este caminho conforme sua estrutura de rotas
        : undefined,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt,
    };
  }

  // ... (Endpoint de download virá aqui abaixo)
  @Get(':id/resume') // Rota: GET /job-application/:id/resume
  async downloadResume(
    @Param('id', ParseIntPipe) applicationId: number,
    @Res() res: Response, // Injeta o objeto de resposta do Express
  ) {
    const resumeData = await this.jobapplicationService.getResumeByApplicationId(applicationId);

    if (!resumeData) {
      throw new NotFoundException(`Currículo não encontrado para a candidatura ID ${applicationId}.`);
    }

    // Define um nome de arquivo para o download
    const filename = `curriculo_${resumeData.candidateName.replace(/\s+/g, '_')}_appID${applicationId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    // Content-Disposition: 'attachment' força o download. 'inline' tenta exibir no navegador.
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); 
    res.send(resumeData.resumeBuffer); // Envia os bytes do PDF
  }
}