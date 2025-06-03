import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminpanelModule } from './admin-panel/adminpanel/adminpanel.module';

@Module({
  imports: [AdminpanelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
