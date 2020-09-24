import { Document, model, Schema } from "mongoose";
import { IPostDoc } from "./post";

export interface IUserDoc extends Document {
  email: string;
  password: string;
  name: string;
  status?: string;
  posts: IPostDoc["_id"][];
}

export interface IUser {
  email: IUserDoc["email"];
  password: IUserDoc["password"];
  name: IUserDoc["name"];
  status?: IUserDoc["status"];
  _id?: IUserDoc["_id"];
  posts: IUserDoc["posts"];
}

const userSchema: Schema<IUserDoc> = new Schema({
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export default model<IUserDoc>("User", userSchema);
