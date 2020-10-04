import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { CLIENT_SECRET } from "../app";
import User, { IUser, IUserDoc } from "../models/user";
import { ITokenReq } from "../middleware/auth";

export const signup: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation is failed, entered correct data"
    ) as any;
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password }: IUser = req.body;
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email,
        name,
        password: hashPassword,
      } as IUser);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User Created!", userId: result._id });
    })
    .catch((err: any) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

export const login: RequestHandler = (req, res, next) => {
  const { email, password }: IUser = req.body;
  let loadedUser: IUserDoc;
  User.findOne({ email })
    .then((user: IUserDoc | null) => {
      if (!user) {
        const error = new Error(
          "User with this email could not be found."
        ) as any;
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong Password") as any;
        error.statusCode = 401;
        throw error;
      }
      // generate web token (using jsonwebtoken) once user is authenticated
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        CLIENT_SECRET, // client secret
        { expiresIn: "1hr" }
      );
      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch((err: any) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

export const getUserStatus: RequestHandler = (req: ITokenReq, res, next) => {
  User.findById(req.userId)
    .then((user: IUserDoc | null) => {
      if (!user) {
        const error = new Error("User not found") as any;
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ status: user.status });
    })
    .catch((err: any) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};

export const updateUserStatus: RequestHandler = (req: ITokenReq, res, next) => {
  const newStatus = req.body.status;
  User.findById(req.userId)
    .then((user: IUserDoc | null) => {
      if (!user) {
        const error = new Error("User not found") as any;
        error.statusCode = 404;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "User updated" });
    })
    .catch((err: any) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};
