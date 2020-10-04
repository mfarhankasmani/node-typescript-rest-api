import express from "express";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer, { Options } from "multer";
import { graphqlHTTP } from "express-graphql";
import { ValidationError } from "express-validator";

import resolvers from "./graphql/resolvers";
import schema from "./graphql/schema";
import { IError } from "./validation";

export const CLIENT_SECRET = "SECRETFORUI";

const app = express();

const MONGODB_URI =
  "mongodb+srv://farhan:MX5XOhPW8MYkaND1@cluster0.mtvre.mongodb.net/messages?retryWrites=true&w=majority";

//use for uploading files like image, pdf etc
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  },
});

const fileFilter: Options["fileFilter"] = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  }
  cb(null, false);
};

// resolving CORS error
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  //Allows user to set content type on client side
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // fix required for option error on graphql
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/src/images", express.static(path.join(__dirname, "images")));

// add graphQL middleware - one route for all the routes
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true, // provides graphQL tool on get request from browser, it needs query defined for it to work
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const { code, data } = err.originalError as IError;
      const message = err.message || "An error occurred.";
      return { message, data, status: code };
    },
  })
);

app.use(
  (
    error: IError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.log(error);
    res.status(error.code).json({ message: error.message, data: error.data });
  }
);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
