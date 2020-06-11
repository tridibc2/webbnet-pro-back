var mongoose = require('mongoose');

const Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    categoryId: {
      type: String,
      unique: true,
      index: true
    },
    categoryName: {
      type: String,
      default: ''
    }
  }
)

mongoose.model('Category', CategorySchema);