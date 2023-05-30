const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    status: {
      type: String,
      default: 'Public'
    },
    desc: {
      type: String,
    },
    img: {
      type: String,
    },
    imgId: {
      type: String,
    },
  },
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post