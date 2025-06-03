import { Module } from '@nestjs/common';
import { AdminpanelService } from './adminpanel.service';
import { AdminpanelController } from './adminpanel.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [AdminpanelController],
  providers: [AdminpanelService],
})
export class AdminpanelModule {}
