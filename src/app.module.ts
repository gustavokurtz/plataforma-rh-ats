import { Module } from '@nestjs/common';
import { CandidateModule } from './admin-panel/candidate/candidate.module';
import { JobapplicationModule } from './admin-panel/jobapplication/jobapplication.module';
import { JobModule } from './admin-panel/jobs/job.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthMiddleware } from './admin-panel/auth/auth.middleware';



@Module({
  imports: [JobModule, PrismaModule, JobapplicationModule, CandidateModule],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule {}
