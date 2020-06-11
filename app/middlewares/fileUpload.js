const multer = require('multer');

let upload = multer({ dest: './uploads/' });




let singleFileUpload = (req, res, next) => {

    upload.single('file')
    const file = req.file;
    console.log(file.filename);
    if (!file) {
      const error = new Error('No File')
      error.httpStatusCode = 400
      return next(error)
    }
      res.send(file);

}


module.exports = {
    singleFileUpload: singleFileUpload
  }