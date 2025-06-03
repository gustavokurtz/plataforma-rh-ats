import { Body, Controller, Post } from '@nestjs/common';
import { JobapplicationService } from './jobapplication.service';
import { CreateJobApplicationDto, JobApplicationResponseDto } from './dto/job-application-dto';

@Controller('job-application')
export class JobapplicationController {
  constructor(private readonly jobapplicationService: JobapplicationService) {}

  @Post()
  async createJobApplication(
    @Body() createJobApplicationDto: CreateJobApplicationDto
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobapplicationService.createJobApplication(createJobApplicationDto);
    
    return {
      id: application.id,
      jobId: application.jobId,
      candidateId: application.candidateId,
      status: application.status,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      candidatePhone: application.candidatePhone || undefined,
      candidateResume: application.candidateResume || undefined,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt
    };
  }
}
