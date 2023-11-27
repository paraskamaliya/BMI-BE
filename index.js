const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./Router/userRouter");
require("dotenv").config();
const app = express();
app.use(express.json())
app.use("/users", userRouter);

app.get("/", (req, res) => {
    res.end("Welcome to Home Page");
})

app.listen(process.env.PORT, async () => {
    try {
        const connection = await mongoose.connect(process.env.mongoURL);
        console.log("Connected to DB")
    } catch (error) {
        console.log(error);
    }
})