'use strict';

import { EarlReport } from '@qualweb/earl-reporter';
import { clone, cloneDeep } from 'lodash';

function transformEarlReport(earlReport: EarlReport): Array<any> {
  const newEarlReport = <any> cloneDeep(earlReport);

  for (const testSubject of newEarlReport.graph || []) {
    testSubject.type = clone(testSubject['@type']);
    delete testSubject['@type'];
    
    testSubject.assertor.id = clone(testSubject.assertor['@id']);
    delete testSubject.assertor['@id'];
    testSubject.assertor.type = clone(testSubject.assertor['@type']);
    testSubject.assertor['@type'];

    for (const assertion of testSubject.assertions || []) {
      assertion.type = clone(assertion['@type']);
      delete assertion['@type'];

      assertion.test.id = clone(assertion.test['@id']);
      delete assertion.test['@id'];
      assertion.test.type = clone(assertion.test['@type']);
      delete assertion.test['@type'];

      assertion.result.type = clone(assertion.result['@type']);
      delete assertion.result['@type'];
    }
  }

  return newEarlReport.graph;
}

function verifyUrl(url: string): string {
  if(url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `http://${url}`;
}

function normalizeUri(uri: string): string {
  uri = uri.replace('https://', '');
  uri = uri.replace('http://', '');
  uri = uri.replace('www.', '');

  return uri;
}

export {
  transformEarlReport,
  verifyUrl,
  normalizeUri
};