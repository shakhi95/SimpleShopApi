//
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const { startIO } = require("./socketIO");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/auth", authRoutes);
app.use("/products", productsRoutes);

mongoose.connect(process.env.MONGO_URL, { dbName: "shop" }).then(() => {
  const httpServer = app.listen(process.env.SERVER_PORT);
  startIO(httpServer, () => console.log("Client Connected !"));
});
