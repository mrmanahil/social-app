const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Post'
    },
    img: {
      type: String,
    },
    imgId: {
      type: String,
    },
  },
);

const Image = mongoose.model("Image", ImageSchema);
module.exports = Image