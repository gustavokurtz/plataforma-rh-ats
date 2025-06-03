import { Module } from '@nestjs/common';
import { JobapplicationService } from './jobapplication.service';
import { JobapplicationController } from './jobapplication.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobapplicationController],
  providers: [JobapplicationService],
})
export class JobapplicationModule {}
