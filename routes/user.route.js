const router = require('express').Router()
const authController = require('../controller/auth.controller')
const userController = require('../controller/user.controller')

router.post('/register', authController.auth)
router.post('/login', authController.signin)

router.put('/update', userController.updatUser)
router.delete('/delete', userController.deleteUser)
router.get('/get', userController.getUser)
router.put('/:id/follow', userController.followUser)
router.put('/:id/unfollow', userController.unfollowUser)
router.post('/request/:id', userController.requestUser)
router.put('/accept', userController.acceptRequest)
router.put('/deny', userController.denyRequest)


module.exports = router