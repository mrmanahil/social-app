const Post = require('../models/post.model')
const Image = require('../models/images.model')
const Request = require('../models/request.model')
const Cloudinary = require('../libs/cloudinary.lib')
const { upload } = require('../libs/multer.lib')
const jwt = require('jsonwebtoken')

exports.creatPost = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyToken = await jwt.verify(token, process.env.JWT_TOKEN)
    try {
        if (req.files.length == 0) {
            const savePost = await Post.create({
                userId: verifyToken.id,
                desc: req.body.desc,
                status: req.body.status
            })
            return res.send({ status: 210, success: true, message: savePost })
        } else {

            const savePost = await Post.create({
                userId: verifyToken.id,
                desc: req.body.desc,
            })

            req.files.forEach(async item => {

                const uploadCloud = await Cloudinary.uploader.upload(item.path, { folder: 'post' })
                await Image.create({
                    postId: savePost.id,
                    img: uploadCloud.public_id,
                    imgId: uploadCloud.secure_url
                })
            });

            // res.status(201).send('Files uploaded successfully')

            res.send({ status: 200, success: true, message: savePost })

        }
    } catch (err) {
        console.log(`Post create error: ${err}`)
    }
}

exports.getPost = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyToken = await jwt.verify(token, process.env.JWT_TOKEN)
    try {
        const getImg = await Image.find({ postId: req.body.postId })
        res.send(getImg)
    } catch (err) {
        console.log(err)
    }
}

exports.getUserPost = async (req, res) => {


    const token = req.headers['x-api-token']
    const verifyToken = await jwt.verify(token, process.env.JWT_TOKEN)
    try {
        const getUserPost = await Post.find({ userId: verifyToken.id })

        const re = await Promise.all(getUserPost.map(async elem => {
            console.log(elem)
            const getUserImage = await Image.find({ postId: elem._id })
            // elem._doc.images = getUserImage
            elem._doc.Image = getUserImage
            return elem

        })
        )
        console.log(re)
        // return
        // console.log(getUserImage)
        return res.send(re)
        // res.send(getUserImage)
        // console.log(getUserImage)

    } catch (err) {
        console.log(err)
    }
}


exports.updatePost = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyToken = await jwt.verify(token, process.env.JWT_TOKEN)
    try {
        if (!req.file) {
            const postData = {
                desc: req.body.desc,
                status: req.body.status
            }
            const updatePost = await Post.findByIdAndUpdate(req.params.id, postData, { new: true })

            return res.send({ status: 210, success: true, message: updatePost })
        }
        let getUser = await Image.findById(req.params.id)
        // res.send(getUser)
        await Cloudinary.uploader.destroy(getUser.img, { folder: 'post' })

        const result = await Cloudinary.uploader.upload(req.file.path, { folder: 'post' })

        const updateData = {
            img: result.public_id,
            imgId: result.secure_url
        }
        getUser = await Image.findByIdAndUpdate(req.params.id, updateData, { new: true })
        res.send(getUser)
    } catch (err) {
        console.log(err)
    }
}

exports.privatePost = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyToken = await jwt.verify(token, process.env.JWT_TOKEN)
    try {

        const friendList = await Request.find({ $or: [{ receiverId: verifyToken.id }, { senderId: verifyToken.id }] })
        // return console.log(friendList)
        const friendStatus = await Promise.all(friendList.map(async ele => {
            if (verifyToken.id == ele.senderId) delete ele._doc.senderId
            if (verifyToken.id == ele.receiverId) delete ele._doc.receiverId
            if (ele.status == 'Accepted') {

                const getPost = await Post.find({
                    $or: [{ status: req.status = 'Friends', userId: ele.sendTo },
                    { status: req.status = 'Friends', userId: ele.receiverId }]
                }).populate('userId')
                // console.log(getPost, "get post")
                const postImages = await Promise.all(getPost.map(async elem => {
                    // console.log(elem.userId)
                    const getPostImage = await Image.find({ postId: elem._id })
                    // elem._doc.images = getUserImage
                    elem._doc.Image = getPostImage
                    return elem
                }))
                return postImages
            }
            else {
                console.log("err")
            }
            return ele
        }))
        return res.send(friendStatus)

    } catch (err) {
        console.log(`Private post error: ${err}`)
    }
}