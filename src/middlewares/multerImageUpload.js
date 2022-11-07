const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) =>
    cb(null, new Date().getTime() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const acceptedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (acceptedTypes.includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

module.exports = multer({ storage: fileStorage, fileFilter: fileFilter });
