import { UrlResolver } from '../models/Url';
import { EvaluationResolver } from '../models/Evaluation';

export default {
  Url: {
    evaluations: EvaluationResolver.getUrlEvaluations
  },
  Evaluation: {
    belongs_to: UrlResolver.getEvaluationUrl
  },
  Query: {
    // URLS
    url: UrlResolver.getUrlById,
    uri: UrlResolver.getUrlByUri,
    urls: UrlResolver.getAllUrls,
    // EVALUATIONS
    evaluation: EvaluationResolver.getEvaluationById,
    evaluations: EvaluationResolver.getAllEvaluations
  },
  Mutation: {
    // URLS
    createUrl: UrlResolver.createUrl,
    // EVALUATIONS
    evaluateUrl: EvaluationResolver.evaluateUrl
  }
};