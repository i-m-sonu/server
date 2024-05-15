const express = require('express');
const cors = require('cors');
const connectToDb = require('./db');
const cookieParser = require('cookie-parser');
const { User } = require("./model")


const server = express();
server.use(cors());
server.use(cookieParser());
server.use(express.json());
connectToDb();

server.post('/user', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);
    try {
        const user = new User({
            firstName,
            lastName,
            email,
            password
        });
        await user.save();
        res.status(200).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error creating user" });
    }
});

server.use("/", (req, res) => {
    res.json({ message: "Server Started and db connected" });
})
server.listen(8080, () => {
    console.log("Server started");
});


