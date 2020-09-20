import { Router } from "express";

export interface Todo {
  id: string;
  text: string;
}

type RequestBody = {
  text: string;
};

type RequestParams = {
  todoId: string;
};

let todos: Todo[] = [];

const router = Router();

router.get("/", (req, res, next) => {
  res.status(200).json({ todos });
});

router.post("/todo", (req, res, next) => {
  // type conversion
  const body = req.body as RequestBody;
  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: body.text,
  };
  todos.push(newTodo);
  res.status(201).json({ message: "Added Todo", todos });
});

router.put("/todo/:todoId", (req, res, next) => {
  const body = req.body as RequestBody;
  const params = req.params as RequestParams;

  const tId = params.todoId;

  const todoIndex = todos.findIndex((todo: Todo) => todo.id === tId.toString());
  if (todoIndex > 0) {
    todos[todoIndex] = {
      id: todos[todoIndex].id,
      text: body.text,
    };
    return res.status(100).json({ message: "update is successful", todos });
  }
  res.status(404).json({ message: "Could not find todo for this id." });
});

router.delete("/todo/:todoId", (req, res, next) => {
  const params = req.params as RequestParams;

  todos = todos.filter((todo) => todo.id !== params.todoId);
  res.status(200).json({ message: "Deleted todo", todos });
});

export default router;
