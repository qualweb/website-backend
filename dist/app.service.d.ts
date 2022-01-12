/// <reference types="@qualweb/types" />
import { QualwebOptions, EvaluationReport } from '@qualweb/core';
export declare class AppService {
    evaluate(options: QualwebOptions): Promise<EvaluationReport>;
}
