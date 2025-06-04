import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CandidateService {
    constructor(private readonly prisma: PrismaService) {}


    async getCandidatesById(id: number) {
        return this.prisma.candidate.findUnique({
            where: { id },
            include: {
                applications: {
                    include: {
                        job: true,
                        
                    }
                },
            }
        });
    }

}
   
