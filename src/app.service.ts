import { Injectable } from '@nestjs/common';
import { QualWeb, QualwebOptions, EvaluationReport } from '@qualweb/core';

@Injectable()
export class AppService {
  async evaluate(options: QualwebOptions): Promise<EvaluationReport> {
    const qualweb = new QualWeb({ adBlock: true, stealth: true });

    await qualweb.start({ timeout: 1000 * 60 * 2 }, { args: ['--no-sandbox', '--ignore-certificate-errors'] });

    let reports = null;
    let error = null;
    try {
      reports = await qualweb.evaluate(options); //this.timeout(qualweb, options);
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

  private timeout(
    qualweb: QualWeb,
    options: QualwebOptions,
  ): Promise<EvaluationReport[]> {
    return new Promise<EvaluationReport[]>((resolve: any, reject: any) => {
      const timeout = setTimeout(() => {
        reject('Time exceeded for evaluation');
      }, 1000 * 60);

      qualweb.evaluate(options).then((reports) => {
        clearTimeout(timeout);
        resolve(reports);
      });
    });
  }
}
