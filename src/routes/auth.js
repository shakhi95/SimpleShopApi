const { Router } = require("express");
const { checkToken, signUp, signIn } = require("../controllers/auth");
const { body } = require("express-validator");
const User = require("../models/user");

const router = Router();

router.post("/check-token", checkToken);

router.post(
  "/sign-up",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter Valid Email Plz!")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) throw Error("Email Already In Use !");
        else return true;
      }),
    //
    body("password")
      .trim()
      .isStrongPassword({ minLength: 4, minSymbols: 0 })
      .withMessage(
        "Password Is Weak : minLength: 4, minUppercase: 1, minNumbers: 1, "
      ),
    //
    body("confirmPassword")
      .trim()
      .custom(async (value, { req }) => {
        if (value !== req.body.password)
          throw Error("Passwords Do Not Match !");
        else return true;
      }),
  ],
  signUp
);

router.post(
  "/sign-in",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter Valid Email Plz!")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) throw Error("Email Does Not Exist !");
        else return true;
      }),
    //
    body("password")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Password minLength: 4 "),
  ],
  signIn
);

module.exports = router;
