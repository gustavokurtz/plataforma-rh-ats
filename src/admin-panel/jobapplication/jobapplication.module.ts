import { Module } from '@nestjs/common';
import { JobapplicationService } from './jobapplication.service';
import { JobapplicationController } from './jobapplication.controller';

@Module({
  controllers: [JobapplicationController],
  providers: [JobapplicationService],
})
export class JobapplicationModule {}
