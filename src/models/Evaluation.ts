import { Schema, model } from 'mongoose';
import { UrlModel } from './Url';

const qualweb = require('@qualweb/core');

import { transformEarlReport, verifyUrl, normalizeUri } from '../lib/_util';

export const EvaluationSchema: Schema = new Schema({
  json: String,
  belongs_to: {
    type: Schema.Types.ObjectId,
    ref: 'Url'
  },
  context: String,
  graph: [{
    type: {
      type: String
    },
    source: String,
    assertor: {
      id: String,
      type: {
        type: String
      },
      title: String,
      description: String,
      hasVersion: String,
      homepage: String
    },
    assertions: [{
      type: {
        type: String
      },
      test: {
        id: String,
        type: {
          type: String
        },
        title: String,
        description: String
      },
      mode: String,
      result: {
        type: {
          type: String
        },
        outcome: String,
        source: [{
          result: {
            pointer: String,
            outcome: String
          }
        }],
        description: String,
        date: String 
      }
    }]
  }],
  updated_date: { type: Date, default: Date.now },
});

export const EvaluationModel = model('Evaluation', EvaluationSchema);

export const EvaluationResolver = {
  evaluateUrl: async (_: any, args: any) => {

    const evaluation = await qualweb.evaluate({
      url: verifyUrl(args.uri),
    });

    args.uri = normalizeUri(args.uri);

    const earlReport = await qualweb.generateEarlReport();

    const json = JSON.stringify(evaluation);

    let url = await UrlModel.findOne({uri: args.uri});

    if (!url) {
      url = await UrlModel.create(args);
    }
    
    const savedEvaluation = await EvaluationModel.create({
      belongs_to: url._id,
      json,
      context: earlReport.context,
      graph: transformEarlReport(earlReport)
    });

    return savedEvaluation;
  },
  getAllEvaluations: () => EvaluationModel.find(),
  getEvaluationById: (_: any, args: any) => EvaluationModel.findById(args._id),
  getUrlEvaluations: (url: any) => EvaluationModel.find({ belongs_to: url._id })
};