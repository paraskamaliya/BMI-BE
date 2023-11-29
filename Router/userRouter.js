const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const { UserModel } = require("../Model/userModel.model");
const { auth } = require("../Middlewares/auth.middleware");
const { ListModel } = require("../Model/listModel.model");
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
                        name, email, password: hash, age, avatar, history
                    })
                    await user.save()
                    res.status(200).send({ "message": "Successfully registered", "userDetails": user })
                }
                else {
                    res.status(202).send({ "message": "Something went wrong.", "error": err })
                }
            })
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", error })
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    try {
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ username: user.username, userId: user._id }, "users", { expiresIn: "1h" });
                    res.status(200).send({ "message": "Successfully logged in", "token": token, "userDetails": user })
                }
                else {
                    res.status(201).send({ "message": "Something went wrong", "error": err })
                }
            })
        }
        else {
            res.status(201).send({ "message": "User is not present, Please Register" })
        }
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", "error": error })
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
        await UserModel.findByIdAndUpdate({ _id: id }, req.body);
        let user = await UserModel.findOne({ _id })
        res.status(200).send({ "message": "user is updated", "userDetails": user })
    } catch (error) {
        res.status(400).send({ "message": "Something went wrong", error })
    }
})

module.exports = { userRouter };