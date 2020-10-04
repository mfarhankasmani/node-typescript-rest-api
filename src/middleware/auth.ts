import { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { CLIENT_SECRET } from "../app";
import { errorObj } from "../validation";

export interface ITokenReq extends Request {
  userId?: string;
  isAuth?: boolean;
}

export interface IDecodedToken {
  userId: string;
}

const isAuth: RequestHandler = (req: ITokenReq, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = (authHeader && authHeader.split(" ")[1]) || "";
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, CLIENT_SECRET) as IDecodedToken;
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken && decodedToken.userId;
  req.isAuth = true;
  next();
};

export default isAuth;
