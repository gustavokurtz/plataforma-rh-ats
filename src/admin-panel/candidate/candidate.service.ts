import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CandidateService {
    constructor(prisma: PrismaService) {
        // Initialization logic can go here if needed
    }

    // Define methods for candidate-related operations here
    
}
