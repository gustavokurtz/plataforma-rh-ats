import { Controller } from '@nestjs/common';
import { JobapplicationService } from './jobapplication.service';

@Controller('jobapplication')
export class JobapplicationController {
  constructor(private readonly jobapplicationService: JobapplicationService) {}
}
