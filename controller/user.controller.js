const User = require('../models/user.model')
const Request = require('../models/request.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const FCM = require('fcm-node');
const express = require('express')

// Update User
exports.updatUser = async (req, res) => {
    try {
        const token = req.headers['x-api-token']
        const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
        console.log(verifyUser)
        console.log(req.body.id)
        if (verifyUser.id === req.body.id) {
            if (req.body.password) {
                try {
                    req.body.password = await bcrypt.hash(req.body.password, 10)
                } catch (err) {
                    return res.status(500).json(err)
                }
            }
            try {
                const user = await User.findByIdAndUpdate(verifyUser.id, { $set: req.body })
                console.log(user)
                res.status(200).json("Account has been updated")
            } catch (err) {
                console.log(err)
            }
        } else {
            return res.status(403).json("You can update only your account!")
        }

        return
    } catch (err) {
        console.log(`User Update: ${err}`)
    }
}

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const token = req.headers['x-api-token']
        const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
        console.log(verifyUser)
        console.log(req.body.id)
        if (verifyUser.id === req.body.id) {
            try {
                const user = await User.findByIdAndDelete(verifyUser.id)
                console.log(user)
                res.status(200).json("Account has been deleted")
            } catch (err) {
                console.log(err)
            }
        } else {
            return res.status(403).json("You can delete only your account!")
        }

        return
    } catch (err) {
        console.log(`User Update: ${err}`)
    }
}

// Get User
exports.getUser = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
    try {
        const user = await User.findById(verifyUser.id)
        console.log(user)
        delete user._doc.password
        res.status(200).json(user)
    } catch (err) {
        console.log(err)
    }
}

// follow a user
exports.followUser = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
    if (req.body.userId !== verifyUser.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(verifyUser.id)
            if (!user.followers.includes(verifyUser.id)) {
                await user.updateOne({ $push: { followers: verifyUser.id } })
                await currentUser.updateOne({ $push: { following: req.params.id } })
                res.status(200).json("User has been followed")
            } else {
                res.status(403).json("you already follow this user")
            }
        } catch (err) {

        }
    } else {
        res.status(403).json("you can't follow yourself")
    }
}

// Unfollow User
exports.unfollowUser = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
    if (req.body.userId !== verifyUser.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(verifyUser.id)
            if (user.followers.includes(verifyUser.id)) {
                await user.updateOne({ $pull: { followers: verifyUser.id } })
                await currentUser.updateOne({ $pull: { following: req.params.id } })
                res.status(200).json("User has been unfollowed")
            } else {
                res.status(403).json("you don't follow this user")
            }
        } catch (err) {

        }
    } else {
        res.status(403).json("you can't unfollow yourself")
    }
}


// Friend requires
exports.requestUser = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
    // const receiver = await Request.findOne(req.body.receiverId)
    const sendReq = await Request.findOne({ $or: [{ receiverId: verifyUser.id, senderId: req.body.id }, { receiverId: req.body.id, senderId: verifyUser.id }] })
    // return console.log(sendReq)
    try {
        if (verifyUser.id == req.body.id) return res.send({ status: 200, success: false, message: 'you cant request yourself' })

        // if (sendReq.status == 'Accepted') return res.send({ status: 200, success: false, message: 'request is accepted' })

        if (!sendReq) {
            const user = await Request.create({ senderId: verifyUser.id, receiverId: req.params.id, sendTo: verifyUser.id })
            res.send({ status: 200, success: true, message: user })

            const serverKey = 'BEUid7sVFoxS1Fv4p82UMBkT7uf5xe3gciYTyMhcnvU3cU-Pt_A6TDfYaRS7wq4FdkAjy8rVZSc56Uqa66cNAB4'; //put your server key here
            const fcm = new FCM(serverKey);

            const message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: 'registration_token',
                collapse_key: 'your_collapse_key',

                notification: {
                    title: 'Request recieve',
                    body: user.name
                },

                data: {  //you can send only notification or only data(or include both)
                    my_key: 'my value',
                    my_another_key: 'my another value'
                }
            };

            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
            return
        } else {
            if (sendReq.status == 'Pending') return res.send({ status: 200, success: false, message: 'Status already in pending' })

            if (sendReq.status == 'Accepted') return res.send({ status: 200, success: false, message: 'request is accepted' })

            const newRecord = await Request.findOneAndUpdate({ _id: sendReq._id }, { status: 'Pending' })
            res.send({ status: 200, success: false, message: 'Request send successfully' })
            return
        }

    }

    catch (err) {
        console.log(`Request error: ${err}`)
    }
}

exports.acceptRequest = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
    const accptReq = await Request.findOne({ $or: [{ receiverId: verifyUser.id, senderId: req.body.id }, { receiverId: req.body.id, senderId: verifyUser.id }] })

    try {
        if (!accptReq) return res.send({ status: 200, success: false, message: 'Request not found' })

        if (verifyUser.id == accptReq.sendTo) return res.send({ status: 200, success: false, message: 'User is not valid' })
        // console.log(verifyUser.id == accptReq.sendTo)
        // return

        if (accptReq.status !== 'Accepted') {
            const acceptReq = await Request.findOneAndUpdate({ _id: accptReq._id }, { status: 'Accepted' })
            res.send({ status: 200, success: true, message: acceptReq })
            return
        }
        res.send({ status: 200, success: true, message: 'Request is already accepted' })
    } catch (err) {
        console.log(`Accept request error: ${err}`)
    }
}

exports.denyRequest = async (req, res) => {
    const token = req.headers['x-api-token']
    const verifyUser = await jwt.verify(token, process.env.JWT_TOKEN)
    const denyReq = await Request.findOne({ $or: [{ receiverId: verifyUser.id, senderId: req.body.id }, { receiverId: req.body.id, senderId: verifyUser.id }] })

    try {
        if (!denyReq) return res.send({ status: 200, success: false, message: 'Request not found' })

        if (verifyUser.id == denyReq.sendTo) return res.send({ status: 200, success: false, message: 'User is not valid' })

        if (denyReq.status !== null) {
            const updatReq = await Request.findOneAndUpdate({ _id: denyReq._id }, { status: null })
            res.send({ status: 200, success: true, message: updatReq })
            return
        }
        res.send({ status: 200, success: false, message: 'Request is already deny' })
    } catch (err) {
        console.log(`Accept request error: ${err}`)
    }
}