import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:url')
  evaluate(@Param('url') url: string): Promise<any> {
    url = decodeURIComponent(url);
    return this.appService.evaluateUrl(url);
  }
}
