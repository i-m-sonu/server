const express = require("express");
const cors = require("cors");
const connectToDb = require("./db");
const cookieParser = require("cookie-parser");
const { User, Login } = require("./model");
const multer = require("multer"); // Allow image to be uploaded to the database
const stripe = require('stripe')('sk_test_51PKjrESIkUweu5Q37cJtLfR2WYg1ik8JwuJzFAHzs3zqVEjFxcKmqw0zijWrvVTz645DUIqBunQZhKdSwkFRlqwI00KJuzpSTI');

const server = express();
server.use(cors());
server.use(cookieParser());
server.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

connectToDb();

server.post("/user", upload.single("profilePicture"), async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
    
  console.log(req.body);
  try {
    const user = new User({
      profilePicture: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      firstName,
      lastName,
      email,
      password,
    });
    await user.save();
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
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
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

server.post("/checkout", async (req, res) => {
  try {
    const { cartProducts, totalAmount } = req.body;

    if (!totalAmount || typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const lineItems = cartProducts.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.text,
        },
        unit_amount: product.Price * 100,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'IN'],
      },
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Error in /checkout:", err);
    res.status(500).json({ message: "Failed to initiate checkout" });
  }
});

server.use("/", (req, res) => {
  res.json({ message: "Server Started and db connected" });
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
