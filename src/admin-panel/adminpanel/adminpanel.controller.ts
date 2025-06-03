import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AdminpanelService } from './adminpanel.service';
import { CreateJobDto, UpdateJobDto } from './dto/job-dto';

@Controller('adminpanel')
export class AdminpanelController {
  constructor(private readonly adminpanelService: AdminpanelService) {}

  @Post('create-job')
  async createJobPosition(@Body() createJobDto: CreateJobDto) {
    return this.adminpanelService.createJobPosition(createJobDto);
  }

  @Get('get-job-positions')
  async getJobPositions() {
    return this.adminpanelService.getJobPositions();
  }

  @Get('get-job/:id')
  async getJobPositionById(@Param('id', ParseIntPipe) id: number) {
    return this.adminpanelService.getJobPositionById(id);
  }

  @Delete('delete-job/:id')
  async deleteJobPosition(@Param('id', ParseIntPipe) id: number) {
    return this.adminpanelService.deleteJobPosition(id);
  }

  @Put('update-job/:id')
  async updateJobPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateJobDto,
  ) {
    return this.adminpanelService.updateJobPosition(id, updateData);
  }
}
