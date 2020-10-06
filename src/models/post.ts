import { Schema, Document, model } from "mongoose";
import { IUserDoc } from "./user";

export interface IPostDoc extends Document {
  title: string;
  content: string;
  imageUrl: string;
  creator: IUserDoc["_id"];
  createdAt: Date | string;
  updatedAt: Date | string;
  _doc: IPost;
}

export interface IPost {
  _id?: IPostDoc["_id"];
  title: IPostDoc["title"];
  content: IPostDoc["content"];
  imageUrl: IPostDoc["imageUrl"];
  creator: IPostDoc["creator"];
  createdAt?: IPostDoc["createdAt"];
  updatedAt?: IPostDoc["updatedAt"];
}

const postSchema: Schema<IPostDoc> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IPostDoc>("Post", postSchema);
