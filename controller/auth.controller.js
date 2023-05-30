const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.auth = async (req, res) => {
    try {
        const pass = await bcrypt.hash(req.body.password, 6)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: pass
        });
        const user = await newUser.save()
        const jwtoken = await jwt.sign({ _id: user._id }, process.env.JWT_TOKEN)
        user._doc.token = jwtoken
        res.send({ status: 200, success: true, message: user })
    } catch (err) {
        console.log(`Register error: ${err}`)
    }
}

exports.signin = async (req, res) => {
    try {
        const userLogin = await User.findOne({ username: req.body.username })
        !userLogin && res.status(404).json("No user available")

        const validPass = await bcrypt.compare(req.body.password, userLogin.password)
        !validPass && res.status(404).json("Passowrd is not valid")

        const token = await jwt.sign({ id: userLogin._id }, process.env.JWT_TOKEN)
        console.log(token)
        res.status(200).json(userLogin)
    } catch (err) {
        console.log(`Login error: ${err}`)
    }
}
