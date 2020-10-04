import { buildSchema, Source } from "graphql";

// const source = new Source(`
//   type TestData {
//     text: String!
//     views: Int!
// }

// type RootQuery {
//     hello: TestData!
// }

// schema {
//     query: RootQuery
// }
// `);

// mutations are for changing data in database and query is for getting data (select query)
const source = new Source(`

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updateAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post]
    }

    type AuthData {
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

const schema = buildSchema(source);

export default schema;
