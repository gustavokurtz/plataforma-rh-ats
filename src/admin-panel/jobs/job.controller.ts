import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto, UpdateJobDto } from './dto/job-dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('create-job')
  async createJobPosition(@Body() createJobDto: CreateJobDto) {
    return this.jobService.createJobPosition(createJobDto);
  }

  @Get('get-job-positions')
  async getJobPositions() {
    return this.jobService.getJobPositions();
  }

  @Get('get-job/:id')
  async getJobPositionById(@Param('id', ParseIntPipe) id: number) {
    return this.jobService.getJobPositionById(id);
  }

  @Delete('delete-job/:id')
  async deleteJobPosition(@Param('id', ParseIntPipe) id: number) {
    return this.jobService.deleteJobPosition(id);
  }

  @Put('update-job/:id')
  async updateJobPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateJobDto,
  ) {
    return this.jobService.updateJobPosition(id, updateData);
  }
}
