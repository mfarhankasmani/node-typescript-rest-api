import { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { CLIENT_SECRET, IError } from "../app";

export interface ITokenReq extends Request {
  userId?: string;
}

export interface IDecodedToken {
  userId: string;
}

const isAuth: RequestHandler = (req: ITokenReq, res, next) => {
  const token = req.get("Authorization")?.split(" ")[1] || "";
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, CLIENT_SECRET) as IDecodedToken;
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated") as IError;
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

export default isAuth;
