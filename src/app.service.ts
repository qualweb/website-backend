import { Injectable } from '@nestjs/common';
import { QualWeb, QualwebOptions, EvaluationReport } from '@qualweb/core';

@Injectable()
export class AppService {
  async evaluate(options: QualwebOptions): Promise<EvaluationReport> {
    const qualweb = new QualWeb({ adBlock: false, stealth: true });

    await qualweb.start(
      { timeout: 1000 * 60 * 2 },
      { args: ['--no-sandbox', '--ignore-certificate-errors'] },
    );

    let reports = null;
    let error = null;
    try {
      reports = await qualweb.evaluate(options);
    } catch (err) {
      error = err;
    } finally {
      await qualweb.stop();
    }

    if (error) {
      throw error;
    }

    return reports[decodeURIComponent(options.url)];
  }
}
