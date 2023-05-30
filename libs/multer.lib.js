const multer = require('multer')

var maxSize = 2 * 1024 * 1024
var storage = multer.diskStorage({
    // destination: (req, file, cb) => {
    //     cb(null, 'upload')
    // },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname)
    },
})

const filefilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true)
    }else{
        cb(null, false)
        return cb('Only PNG, JPG and JPEG format allowed')
    }
}

const upload = multer({storage: storage, fileFilter: filefilter, limits: {fileSize: maxSize}})

module.exports = {upload}