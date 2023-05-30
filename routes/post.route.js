const router = require('express').Router()
const postController = require('../controller/post.controller')
const { upload } = require('../libs/multer.lib')

router.post('/create', upload.array('image'), postController.creatPost)
router.get('/get', postController.getPost)
router.get('/getpost', postController.getUserPost)
router.put('/update/:id', upload.single('image'), postController.updatePost)
router.get('/private', postController.privatePost)

module.exports = router