import express from "express";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import feedRoutes from "./routes/feed";

export interface IError extends Error {
  statusCode: number;
}

const app = express();
const MONGODB_URI =
  "mongodb+srv://farhan:MX5XOhPW8MYkaND1@cluster0.mtvre.mongodb.net/messages?retryWrites=true&w=majority";

// Use for accepting json in req body
app.use(bodyParser.json());

//redirect request to images folder
app.use("/images", express.static(path.join(__dirname, "images")));

// resolving CORS error
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  //Allows user to set content type on client side
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use(
  (
    error: IError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.log(error);
    res.status(error.statusCode).json({ message: error.message });
  }
);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => app.listen(8080))
  .catch((err) => console.log(err));
