import { Body, Controller, Post } from '@nestjs/common';
import { JobapplicationService } from './jobapplication.service';
import { CreateJobApplicationDto } from './dto/job-application-dto';

@Controller('job-application')
export class JobapplicationController {
  constructor(private readonly jobapplicationService: JobapplicationService) {}


  @Post()
  async createJobApplication(@Body() createJobApplicationDto: CreateJobApplicationDto) {
    return this.jobapplicationService.createJobApplication(createJobApplicationDto);
  }
}
