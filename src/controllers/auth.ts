import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import { IError } from "../app";
import User, { IUser } from "../models/user";

export const signup: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation is failed, entered correct data"
    ) as IError;
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
    .catch((err: IError) => {
      if (!err.statusCode) {
        console.log(err);
        err.statusCode = 500;
      }
      next(err);
    });
};
