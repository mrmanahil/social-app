// const app = require('../../testAuth/route/route.index')
const app = require("express");
const userRoute = require("./user.route");
const postRoute = require("./post.route");

app.use("/user", userRoute);
app.use("/post", postRoute);

module.exports = app;
