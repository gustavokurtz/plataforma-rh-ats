import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobModule } from './admin-panel/jobs/job.module';
import { PrismaModule } from './prisma/prisma.module';
import { JobapplicationModule } from './admin-panel/jobapplication/jobapplication.module';
import { CandidateModule } from './admin-panel/candidate/candidate.module';


@Module({
  imports: [JobModule, PrismaModule, JobapplicationModule, CandidateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
