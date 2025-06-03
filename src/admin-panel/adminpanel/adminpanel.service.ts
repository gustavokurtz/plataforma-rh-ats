import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminpanelService {
  constructor(private readonly http: HttpService) {
    
  }
}
