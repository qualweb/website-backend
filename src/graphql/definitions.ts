import { gql } from 'apollo-server';

export default gql`
  type Url {
    _id: ID!
    uri: String!
    evaluations: [Evaluation!]!
  }

  type Evaluation {
    _id: ID!
    belongs_to: Url!
    json: String!
    context: String!
    graph: [TestSubject]!
  }

  type TestSubject {
    type: String!
    source: String!
    assertor: Assertor!
    assertions: [Assertion]!
  }

  type Assertor {
    id: String!
    type: String!
    title: String!
    description: String!
    hasVersion: String!
    homepage: String!
  }

  type Assertion {
    type: String!
    test: Test!
    mode: String!
    result: TestResult!
  }

  type Test {
    id: String!
    type: String!
    title: String!
    description: String!
  }

  type TestResult {
    type: String!
    outcome: String!
    source: [Source]!
    description: String!
    date: String!
  }

  type Source {
    result: SourceResult!
  }

  type SourceResult {
    pointer: String!
    outcome: String!
  }

  type Query {
    url(_id: ID!): Url
    uri(uri: String!): Url
    evaluation(_id: ID!): Evaluation
    
    urls: [Url!]!
    evaluations: [Evaluation!]!
  }

  type Mutation {
    createUrl(uri: String!): Url
    evaluateUrl(uri: String!): Evaluation
  }
`;