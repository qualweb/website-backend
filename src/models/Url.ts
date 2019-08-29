import { Schema,  model } from 'mongoose';

export const UrlSchema: Schema = new Schema({
  uri: {
    type: String,
    unique: true
  },
  evaluations: {
    type: Schema.Types.Array,
    ref: 'Evaluation'
  },
  updated_date: { type: Date, default: Date.now }
});

export const UrlModel = model('Url', UrlSchema);

export const UrlResolver = {
  createUrl: (_: any, args: any) => UrlModel.create(args),
  getAllUrls: () => UrlModel.find(),
  getUrlById: (_: any, args: any) => UrlModel.findById(args._id),
  getUrlByUri: (_: any, args: any) => UrlModel.find({uri: args.uri}),
  getEvaluationUrl: (evaluation: any) => UrlModel.findById(evaluation.belongs_to)
};