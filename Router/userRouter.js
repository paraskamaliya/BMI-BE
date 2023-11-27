const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const { UserModel } = require("../Model/userModel.model");
const { auth } = require("../Middlewares/auth.middleware");
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
    const { name, email, password, age, avatar, history } = req.body;
    const user = await UserModel.findOne({ email });
    try {
        if (user) {
            res.status(201).send({ "message": "User email is present, please try with another email." })
        }
        else {
            bcrypt.hash(password, 5, async (err, hash) => {
                if (hash) {
                    const user = new UserModel({
                        name, email, password, age, avatar, history
                    })
                    await user.save()
                    res.status(200).send({ "message": "Successfully registered", user })
                }
                else {
                    res.status(202).send({ "message": "Something went wrong.", err })
                }
            })
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", error, ok: false })
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne(email);
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ username: user.username, userId: user._Id }, "users", { expiresIn: "1h" });
                    res.status(200).send({ "message": "Successfully logged in", token, ok: true })
                }
                else {
                    res.status(201).send({ "message": "Something went wrong", ok: false, err })
                }
            })
        }
        else {
            res.status(201).send({ "message": "User is not present, Please Register", ok: false })
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", error, ok: false })
    }
})

userRouter.get("/logout", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        const newTkn = new ListModel({ token });
        await newTkn.save();
        res.status(200).send({ "message": "Logout successful" })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "err": error })
    }
})

userRouter.patch("/:id/update", auth, async (req, res) => {
    const { id } = req.params;
    try {
        await UserModel.findByIdAndUpdate({ _Id: id }, req.body);
        res.status(200).send({ "message": "user is updated", ok: true, user })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", ok: false, error })
    }
})

module.exports = { userRouter };