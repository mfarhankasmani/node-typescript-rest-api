import { buildSchema, Source } from "graphql";

const source = new Source(`
  type TestData {
    text: String!
    views: Int!
}

type RootQuery {
    hello: TestData!
}

schema {
    query: RootQuery
}
`);

const schema = buildSchema(source);

export default schema;
