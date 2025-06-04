import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CandidateService } from './candidate.service';

@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}


  @Get(':id')
  async getCandidatesById(@Param('id', ParseIntPipe) id: number) {
    return this.candidateService.getCandidatesById(id);
  }
}
