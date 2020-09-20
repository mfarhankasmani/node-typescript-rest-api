import express from "express";
import bodyParser from "body-parser";
import feedRoutes from "./routes/feed";

const app = express();

// Use for accepting json in req body
app.use(bodyParser.json());

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

app.listen(8080);
