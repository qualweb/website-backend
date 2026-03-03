import { Controller, Post, Request } from '@nestjs/common';
import { QualwebOptions } from '@qualweb/core';
import { ACTRules } from '@qualweb/act-rules';
import { WCAGTechniques } from '@qualweb/wcag-techniques';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('url')
  async evaluateUrl(@Request() req: any): Promise<any> {
    try {

      const modules = [];
      if (req.body?.act) modules.push(new ACTRules())
      if (req.body?.wcag) modules.push(new WCAGTechniques())

      const options: QualwebOptions = {
        url: decodeURIComponent(req.body.url),
        waitUntil: ['load', 'networkidle0'],
        modules
      };

      const report = await this.appService.evaluate(options);

      return { status: 1, message: 'Evaluation done successfully.', report };
    } catch (err) {
      return { status: 2, message: 'An error has ocurred while evaluating.' };
    }
  }
}
