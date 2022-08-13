const router = require("express").Router();
const { body, param, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const Todo = require("../models/todo.model");

router.get(
  "/:id",
  param("id").exists().withMessage("Must provide a list ID"),
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({
        errors: validationErrors.array(),
      });
    } else {
      Todo.find()
        .where({ listId: req.params.id })
        .exec()
        .then((todos) => {
          res.status(StatusCodes.OK).json({
            count: todos.length,
            todos,
          });
        })
        .catch((err) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err,
          });
        });
    }
  }
);

router.post("/", (req, res) => {
  if (!req.body.listId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Must provide a list ID",
    });
  } else {
    const todo = new Todo({
      listId: req.body.listId,
      todoName: req.body.todoName,
    });
    todo
      .save()
      .then((todo) => {
        res.status(StatusCodes.CREATED).json({
          message: "Todo created successfully",
          todo,
        });
      })
      .catch((err) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: err,
        });
      });
  }
});

router.delete("/:id", (req, res) => {
  let todoId = req.params.id;
  Todo.findByIdAndDelete(todoId, (err, todo) => {
    if (err) {
      res.status(StatusCodes.CONFLICT).json({
        error: err,
      });
    } else {
      res.status(StatusCodes.OK).json({
        deleted: todo,
      });
    }
  });
});

router.put("/:id", (req, res) => {
  let todoId = req.params.id;
  let status = req.body.status;
  let dueDate = new Date(req.body.dueDate);
  let important = req.body.important;

  Todo.findByIdAndUpdate(
    todoId,
    { status: status, dueDate: dueDate, important: important },
    (err, result) => {
      if (err) {
        res.status(StatusCodes.CONFLICT).json({
          error: err,
        });
      } else {
        res.status(StatusCodes.OK).json({
          result,
        });
      }
    }
  );
});

module.exports = router;
