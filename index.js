const express = require('express');
const cors = require('cors');
const connectToDb = require('./db');
const cookieParser = require('cookie-parser');
const { User, Login } = require("./model")


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

server.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (user.password !== password) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }
        const login = new Login({ userId: user._id });
        await login.save();
        res.status(200).json({ message: "Login successful", user });
        
    } catch (err) {
        res.status(500).json({ message: "Error logging in" });
    }
});

server.use("/", (req, res) => {
    res.json({ message: "Server Started and db connected" });
})
server.listen(8080, () => {
    console.log("Server started");
});


