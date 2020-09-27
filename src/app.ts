import express from "express";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer, { Options } from "multer";
import io from "socket.io";

import feedRoutes from "./routes/feed";
import authRoutes from "./routes/auth";
import { ValidationError } from "express-validator";

export const CLIENT_SECRET = "SECRETFORUI";
export interface IError extends Error {
  statusCode: number;
  data?: ValidationError[];
}

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
  next();
});

// Use for accepting json in req body
app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/src/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

//redirect request to images folder

app.use(
  (
    error: IError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.log(error);
    res
      .status(error.statusCode)
      .json({ message: error.message, data: error.data });
  }
);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    const server = app.listen(8080);
    const socket = io(server);
    socket.on("connection", socket => {
      console.log("Client Connected");
    });
  })
  .catch((err) => console.log(err));
