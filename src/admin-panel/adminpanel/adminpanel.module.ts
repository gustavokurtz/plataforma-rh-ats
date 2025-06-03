import { Module } from '@nestjs/common';
import { AdminpanelService } from './adminpanel.service';
import { AdminpanelController } from './adminpanel.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AdminpanelController],
  providers: [AdminpanelService],
})
export class AdminpanelModule {}
