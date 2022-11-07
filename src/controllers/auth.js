//
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.checkToken = (req, res, next) => {
  //
  const token = req.headers.authorization;
  let isTokenOk = false;

  try {
    isTokenOk = Boolean(jwt.verify(token, "ThisIsMySecretForNow"));
  } catch (error) {}

  res.json(isTokenOk);
};

exports.signIn = async (req, res, next) => {
  //
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }

  const user = await User.findOne({ email });
  const isPassCorrect = await bcrypt.compare(password, user.password);

  if (!isPassCorrect) {
    res.json({ isSuccess: false, error: "Password Is Not Correct !" });
    return;
  }

  const token = jwt.sign(
    { email, userId: user._id.toString() },
    "ThisIsMySecretForNow",
    { expiresIn: "1h" }
  );

  res.json({ isSuccess: true, error: "", token });
};

exports.signUp = async (req, res, next) => {
  //
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }

  const hashedPass = await bcrypt.hash(password, 12);
  const newUser = await User.create({ email, password: hashedPass });

  if (newUser._id) {
    res.json({ isSuccess: true, error: "" });
    return;
  }
};
