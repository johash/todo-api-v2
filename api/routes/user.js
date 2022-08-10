const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

router.post(
  "/register",
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters"),
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        errors: validationErrors.array(),
      });
    }
    User.findOne({ email: req.body.email }, (err, user) => {
      if (user) {
        return res.status(StatusCodes.CONFLICT).json({
          message: "User already exists",
          user,
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then((result) => {
              res.status(StatusCodes.CREATED).json({
                message: "User created successfully",
                result,
              });
            })
            .catch((err) => {
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: err,
              });
            });
        });
      }
    });
  }
);

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
      });
    } else {
      bcrypt.compare(req.body.password, user.password, (err, isValid) => {
        if (isValid) {
          const token = JWT.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
          });
          return res.status(StatusCodes.OK).json({
            accessToken: token,
            message: "Login successful",
            user,
          });
        } else {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Invalid email or password",
          });
        }
      });
    }
  });
});

router.get("/verify", (req, res) => {
  const accessToken = req.headers["x-auth-token"];
  if (accessToken) {
    JWT.verify(accessToken, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Invalid Token",
          status: StatusCodes.UNAUTHORIZED,
        });
      } else {
        return res.status(StatusCodes.OK).json({
          message: "Token Validated",
          status: StatusCodes.OK,
        });
      }
    });
  }
});

module.exports = router;
