const { Router } = require("express");
const mongoose = require("mongoose");
const { body } = require("express-validator");
const {
  getAllProducts,
  getMyProducts,
  createProduct,
  editProduct,
  deleteProduct,
  addProductToCart,
  getMyCart,
  removeProductFromCart,
  getMyCartAsPdf,
} = require("../controllers/products");
const isAuth = require("../middlewares/isAuth");
const multerImageUpload = require("../middlewares/multerImageUpload");
const Product = require("../models/product");

const router = Router();

router.get("/getAll", getAllProducts);

router.get("/getMyProducts", isAuth, getMyProducts);

router.post(
  "/create",
  isAuth,
  multerImageUpload.single("image"),
  [
    body("title", "Check Title").notEmpty(),
    body("price", "Check Price").notEmpty(),
    body("description", "Check Description").notEmpty(),
    body("image").custom((value, { req }) => {
      if (!req.file) throw Error("Enter Valid Image !");
      else return true;
    }),
  ],
  createProduct
);

router.post(
  "/edit",
  isAuth,
  multerImageUpload.single("image"),
  [
    body("productId").custom(async (value, { req }) => {
      const product = await Product.findOne({
        _id: value,
        owner: new mongoose.Types.ObjectId(req.userId),
      });
      if (!product) throw Error("No Such Product Or It's Not This User !");
      else return true;
    }),
    body("title", "Check Title").notEmpty(),
    body("price", "Check Price").notEmpty(),
    body("description", "Check Description").notEmpty(),
    body("image").custom((value, { req }) => {
      if (!req.file) throw Error("Enter Valid Image !");
      else return true;
    }),
  ],
  editProduct
);

router.post(
  "/delete",
  isAuth,
  [
    body("productId").custom(async (value, { req }) => {
      const product = await Product.findOne({
        _id: value,
        owner: new mongoose.Types.ObjectId(req.userId),
      });
      if (!product) throw Error("No Such Product Or It's Not This User !");
      else return true;
    }),
  ],
  deleteProduct
);

router.post(
  "/add-to-cart",
  isAuth,
  [
    body("productId").custom(async (value, { req }) => {
      const product = await Product.findOne({ _id: value });
      if (!product) throw Error("No Such Product");
      else return true;
    }),
  ],
  addProductToCart
);

router.get("/getMyCart", isAuth, getMyCart);

router.get("/getMyCartAsPdf", isAuth, getMyCartAsPdf);

router.post(
  "/remove-from-cart",
  isAuth,
  [
    body("productId").custom(async (value, { req }) => {
      const product = await Product.findOne({ _id: value });
      if (!product) throw Error("No Such Product");
      else return true;
    }),
  ],
  removeProductFromCart
);

module.exports = router;
