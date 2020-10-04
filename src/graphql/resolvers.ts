const resolver = {
    // method name should match the query
  hello() {
    return {
      text: "Hello World",
      views: 12345,
    };
  },
};

export default resolver;

// export const helloResolver = {
//   Query: {
//     hello: () => {
//       return {
//         text: "Hello World",
//         views: 12345,
//       };
//     },
//   },
// };
