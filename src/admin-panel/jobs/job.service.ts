import { CreateJobDto, UpdateJobDto } from './dto/job-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async createJobPosition(createJobDto: CreateJobDto){
    try {
        const data = await this.prisma.job.create({
            data: {
                title: createJobDto.title,
                description: createJobDto.description,
                salary: createJobDto.salary,
                location: createJobDto.location,
            },
        });
        return data;
    } catch (error) {
        console.error('Error creating job position:', error);
        throw new Error('Failed to create job position'); 
    }
  }


  async getJobPositionById(id: number) {
    try {
      const data = await this.prisma.job.findUnique({
        where: { id },
        include: {
          applications: {
            include: {
              candidate: true
            }
          }
        }
      });
      
      if (!data) {
        throw new NotFoundException(`Job position with ID ${id} not found`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching job position by ID:', error);
      throw new Error('Failed to fetch job position by ID');
    }
  }

  async getJobPositions() {
    try {
      const data = await this.prisma.job.findMany();
      return data;
    } catch (error) {
      console.error('Error fetching job positions:', error);
      throw new Error('Failed to fetch job positions');
    }
  }

    async deleteJobPosition(id: number) {
        try {
        const data = await this.prisma.job.delete({
            where: { id },
        });
        return data;
        } catch (error) {
        console.error('Error deleting job position:', error);
        throw new Error('Failed to delete job position');
        }
    }

    async updateJobPosition(id: number, updateData: UpdateJobDto) {
        try {
            const data = await this.prisma.job.update({
                where: { id },
                data: updateData,
            });
            return data;
        } catch (error) {
            console.error('Error updating job position:', error);
            throw new Error('Failed to update job position');
        }
    }

}
