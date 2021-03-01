import { Injectable } from '@nestjs/common';
import { QualWeb, QualwebOptions, EvaluationReport } from '@qualweb/core';

@Injectable()
export class AppService {
  async evaluate(options: QualwebOptions): Promise<EvaluationReport> {
    const qualweb = new QualWeb();

    await qualweb.start();
    const reports = await qualweb.evaluate(options);
    await qualweb.stop();

    const report = reports[decodeURIComponent(options.url)];
    delete report.system.page.dom.source.html.parsed;

    return report;
  }
}
