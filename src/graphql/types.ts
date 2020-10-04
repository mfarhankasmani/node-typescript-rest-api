export interface IUserInputArgs {
  userInput: IUserInput;
}
export interface IUserInput extends ILoginInput {
  name: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IPostInputData {
  postInput: IPostInput;
}

export interface IPostInput {
  title: string;
  content: string;
  imageUrl: string;
}

export interface IFindUser {
  existingUser?: boolean;
  email?: string;
  id?: string;
}
