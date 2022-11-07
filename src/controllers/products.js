//
const { validationResult } = require("express-validator");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const User = require("../models/user");
const { getIO } = require("../socketIO");

exports.getAllProducts = async (req, res, next) => {
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .populate("owner", "email -_id");
  res.json(products);
};

exports.getMyProducts = async (req, res, next) => {
  //
  const userId = req.userId;

  const products = await Product.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "email -_id");

  res.json(products);
};

exports.createProduct = async (req, res, next) => {
  //

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }

  const userId = req.userId;

  const title = req.body.title;
  const price = req.body.price;
  const image = "images/" + req.file.filename;
  const description = req.body.description;

  const product = await Product.create({
    title,
    price,
    image,
    description,
    owner: userId,
  });

  if (product._id) {
    res.json({ isSuccess: true, error: "" });
    const io = getIO();
    io.emit("products-changed");
  } else res.json({ isSuccess: false, error: "Something Went Wrong !" });
};

exports.editProduct = async (req, res, next) => {
  //
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }

  const title = req.body.title;
  const price = req.body.price;
  const image = "images/" + req.file.filename;
  const description = req.body.description;
  const productId = req.body.productId;

  const oldProductData = await Product.findByIdAndUpdate(productId, {
    title,
    price,
    image,
    description,
  });

  if (oldProductData._id) {
    const imageName = oldProductData.image.split("/")[1];
    const imagePath = path.join("public", "images", imageName);
    fs.unlink(imagePath, (err) => {});
    res.json({ isSuccess: true, error: "" });
    const io = getIO();
    io.emit("products-changed");
  } else res.json({ isSuccess: false, error: "Something Went Wrong !" });
};

exports.deleteProduct = async (req, res, next) => {
  //
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }

  const productId = req.body.productId;
  const removedDoc = await Product.findByIdAndRemove({ _id: productId });

  if (removedDoc._id) {
    const imageName = removedDoc.image.split("/")[1];
    const imagePath = path.join("public", "images", imageName);
    fs.unlink(imagePath, (err) => {});
    res.json({ isSuccess: true, error: "" });
    const io = getIO();
    io.emit("products-changed");
  } else res.json({ isSuccess: false, error: "Something Went Wrong !" });
};

exports.addProductToCart = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }
  const userId = req.userId;
  const productId = req.body.productId;

  const user = await User.findOne({ _id: userId });
  let userCart = user.cart;

  const isProductAlreadyExist = Boolean(
    userCart.find(({ product }) => product._id.toString() === productId)
  );

  if (isProductAlreadyExist) {
    userCart = userCart.map(({ product, quantity }) => {
      if (product._id.toString() === productId)
        return { product, quantity: quantity + 1 };
      else return { product, quantity };
    });
  } else {
    userCart.push({ product: productId, quantity: 1 });
  }

  const result = await user.updateOne({ cart: userCart });
  if (result.acknowledged) res.json({ isSuccess: true, error: "" });
  else res.json({ isSuccess: false, error: "Something Went Wrong !" });
};

exports.getMyCart = async (req, res, next) => {
  //
  const userId = req.userId;
  const user = await User.findOne({ _id: userId }).populate(
    "cart.product",
    "title price"
  );
  const cleanCart = user.cart.filter(({ product }) => Boolean(product));
  res.json(cleanCart);
};

exports.getMyCartAsPdf = async (req, res, next) => {
  //
  const userId = req.userId;
  const user = await User.findOne({ _id: userId }).populate(
    "cart.product",
    "title price"
  );
  const cleanCart = user.cart.filter(({ product }) => Boolean(product));

  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(res);
  pdfDoc.fontSize(14);
  pdfDoc.text("UserCart", { align: "center" });
  pdfDoc.text("Title", 50, 130);
  pdfDoc.text("Quantity", 230, 130);
  pdfDoc.text("Price", 350, 130);
  pdfDoc.text("Total", 470, 130);

  let total = 0;

  cleanCart.forEach(({ product, quantity }, inx) => {
    pdfDoc.text(product.title, 50, 180 + inx * 50);
    pdfDoc.text(quantity, 230, 180 + inx * 50);
    pdfDoc.text(product.price, 350, 180 + inx * 50);
    pdfDoc.text(+quantity * +product.price, 470, 180 + inx * 50);

    total = total + +quantity * +product.price;
    if (inx === cleanCart.length - 1) {
      pdfDoc.text("==== > ToTal : ", 50, 180 + inx * 50 + 50);
      pdfDoc.text(total, 470, 180 + inx * 50 + 50);
    }
  });

  pdfDoc.end();
};

exports.removeProductFromCart = async (req, res, next) => {
  //
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    res.json({ isSuccess: false, error: errorsArray[0].msg });
    return;
  }
  const userId = req.userId;
  const productId = req.body.productId;

  const user = await User.findOne({ _id: userId });

  const userCart = user.cart.filter(
    ({ product }) => product._id.toString() !== productId
  );

  const result = await user.updateOne({ cart: userCart });
  if (result.acknowledged) res.json({ isSuccess: true, error: "" });
  else res.json({ isSuccess: false, error: "Something Went Wrong !" });
};
