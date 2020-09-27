import { buildSchema } from "graphql";

const schema = buildSchema(`
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

export default schema;
