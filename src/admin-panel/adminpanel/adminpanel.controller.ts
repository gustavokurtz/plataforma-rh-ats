import { Controller } from '@nestjs/common';
import { AdminpanelService } from './adminpanel.service';

@Controller('adminpanel')
export class AdminpanelController {
  constructor(private readonly adminpanelService: AdminpanelService) {}
}
