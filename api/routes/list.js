const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const JWT = require("jsonwebtoken");
const List = require("../models/list.model");

router.get("/", (req, res) => {
  const accessToken = req.headers["x-auth-token"];
  if (accessToken) {
    const decode = verifyAccessToken(accessToken);
    if (decode instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: decode.message,
      });
      return;
    }
    if (decode) {
      List.find({ userId: decode.userId }, (err, lists) => {
        res.status(StatusCodes.OK).json({
          lists,
        });
      });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Request must be made with an access token",
    });
  }
});

router.post("/", (req, res) => {
  const accessToken = req.headers["x-auth-token"];
  if (accessToken) {
    const decode = verifyAccessToken(accessToken);
    if (decode instanceof Error) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: decode.message,
      });
      return;
    }
    if (decode) {
      const list = new List({
        userId: decode.userId,
        listName: req.body.listName,
      });
      list
        .save()
        .then((result) => {
          res.status(StatusCodes.CREATED).json({
            message: "New list added",
            result,
          });
        })
        .catch((err) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err,
          });
        });
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Request must be made with an access token",
    });
  }
});

router.delete("/:id", (req, res) => {
  List.findByIdAndDelete(req.params.id, (err, list) => {
    if (err) {
      return res.status(StatusCodes.CONFLICT).json({
        error: err,
      });
    } else {
      res.status(StatusCodes.OK).json({
        deleted: list,
      });
    }
  });
});

router.put("/:id", (req, res) => {
  let listId = req.params.id;
  let updatedName = req.body.listName;
  if (listId) {
    List.findByIdAndUpdate(listId, { listName: updatedName }, (err, list) => {
      if (err) {
        return res.status(StatusCodes.CONFLICT).json({
          error: err,
        });
      } else {
        res.status(StatusCodes.OK).json({
          updated: list,
        });
      }
    });
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Request must be presented with an ID in path variables",
    });
  }
});

const verifyAccessToken = (token) => {
  return JWT.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return new Error(err.message);
    } else {
      return payload;
    }
  });
};

module.exports = router;
