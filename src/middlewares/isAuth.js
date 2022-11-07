//
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //
  const tokenAttached = req.headers.authorization;

  if (!tokenAttached) {
    res.status(401).json("Not Authorized");
    return;
  }

  let user = null;

  try {
    user = jwt.verify(tokenAttached, "ThisIsMySecretForNow");
  } catch (error) {}

  if (!user) {
    res.status(401).json("Not Authorized");
    return;
  }

  req.userId = user.userId;
  next();
};
