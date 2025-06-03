import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
