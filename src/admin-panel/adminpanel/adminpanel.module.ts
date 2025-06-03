import { Module } from '@nestjs/common';
import { AdminpanelService } from './adminpanel.service';
import { AdminpanelController } from './adminpanel.controller';

@Module({
  controllers: [AdminpanelController],
  providers: [AdminpanelService],
})
export class AdminpanelModule {}
