import { Controller, Post, Request } from '@nestjs/common';
import { QualwebOptions } from '@qualweb/core';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('url')
  async evaluateUrl(@Request() req: any): Promise<any> {
    try {
      const options: QualwebOptions = {
        url: decodeURIComponent(req.body.url),
        execute: {
          act: !!req.body?.act,
          wcag: !!req.body?.wcag,
        },
        "wcag-techniques": {
          exclude: ['QW-WCAG-T16']
        }
      };

      const report = await this.appService.evaluate(options);

      return { status: 1, message: 'Evaluation done successfully.', report };
    } catch (err) {
      return { status: 2, message: 'An error has ocurred while evaluating.' };
    }
  }
}
