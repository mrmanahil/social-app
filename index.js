const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const mainRouter = require("./routes/main.route");

const app = express();
dotenv.config();
// const url = 'mongodb://localhost/social'
const port = 5500;
app.use(express.json());

app.use("/api", mainRouter);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Listning port ${port}`);
    });
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Database Connection Failed!");
  });
