import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const stripe = require("stripe")(
  "sk_test_51MwTwUSJjI3p9lEKYDt92qNYTndFI7bj6Yi3o8y1jlhTL6pKbSSzHozKOdriulGQKGi9twnlc1WquXrcQONO9HUW00P84y6CWg"
);

const app = express();

// Set up view engine
app.set("view engine", "ejs");

// Set up static files
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "ecommerce",
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const JWT_TOKEN_KEY = "homedecore123456";
//Generate JWT Token
function generateToken(id) {
  try {
    return jwt.sign({ user: id }, JWT_TOKEN_KEY, {
      expiresIn: "24h",
    });
  } catch (err) {
    return res.status(401).send("Failed to Generate Token");
  }
}

//Verify JWT Token
function verifyToken(req, res, next) {
  let token =
    req.headers.authorization || req.headers.authorization.startsWith("Bearer");
  try {
    token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, JWT_TOKEN_KEY);
  } catch (err) {
    return res.status(401).send("Token Failed");
  }
  return next();
}
// USERS OPERATIONS
app.get("/api/auth/checkEmail/:email", (req, res) => {
  const q = "SELECT email from users WHERE email=?";
  const email = req.params.email;
  db.query(q, [email], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/api/user/:id", (req, res) => {
  const q = "SELECT * FROM users WHERE user_id = ?";
  const id = req.params.id;
  db.query(q, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/api/auth/login", (req, res) => {
  const q = "SELECT * FROM users WHERE email = ? AND password = ?";
  const email = req.body.email;
  const password = req.body.password;
  res.setHeader("Content-Type", "application/json");
  db.query(q, [email, password], (err, data) => {
    if (err) {
      return new Error("Db error: " + err);
    }
    if (data.length <= 0) {
      res.status(401);
      res.send({ message: "User Not Registered!" });
      return;
    }
    const user = data.pop();
    res.send({
      user: user,
      accessToken: generateToken(user.user_id),
    });
  });
});

app.post("/api/register", (req, res) => {
  const q =
    "INSERT INTO users (first_name, last_name, mobile_no, email, password) VALUES (?)";
  const values = [
    req.body.firstname,
    req.body.lastname,
    req.body.mobile,
    req.body.email,
    req.body.password,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/api/users", (req, res) => {
  const q = "SELECT * FROM users";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// PRODUCTS OPERATIONS
app.get("/api/products", (req, res) => {
  const q = "SELECT * FROM products";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/api/product/:id", (req, res) => {
  const q = "SELECT * FROM products WHERE product_id = ?";
  const id = req.params.id;
  db.query(q, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// ORDERS OPERATIONS

app.get("/api/orders/:id", verifyToken, (req, res) => {
  const q = "SELECT * FROM orders WHERE user_id = ?";
  const id = req.params.id;
  db.query(q, [id], (err, data) => {
    if (err) return res.json(err);
    if (data.length <= 0) {
      // res.status(401);
      res.send({ message: "No Orders FOund!" });
      return;
    }
    return res.json(data);
  });
});

app.post("/api/addOrder", verifyToken, (req, res) => {
  const q =
    "INSERT INTO orders(order_status, payment_status, products, user_id, address, order_email, order_number, order_price, order_date) VALUES (?)";
  const values = [
    req.body.order_status,
    req.body.payment_status,
    req.body.products,
    req.body.user_id,
    req.body.address,
    req.body.order_email,
    req.body.order_number,
    req.body.order_price,
    req.body.order_date,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.put("/api/cancelOrder/:id", (req, res) => {
  const q = "UPDATE orders SET order_status = ? WHERE id = ?";
  const id = req.params.id;
  const orderStatus = [req.body.orderStatus];
  db.query(q, [address, id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Handle payment form submission
app.post("/pay", verifyToken, async (req, res) => {
  try {
    const {
      email,
      amount,
      currency,
      payment_method,
      description,
      name,
      address,
    } = req.body;
    // Create a new customer
    const customer = await stripe.customers.create({
      email: email,
      payment_method: payment_method.id,
      name: name,
      address: {
        line1: address,
        postal_code: "98140",
        state: "Maharashtra",
        country: "India",
      },
    });

    // Create a new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      description: description,
    });

    // Return the payment intent client secret to the client
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

app.listen(8080, () => {
  console.log("connected to backend!");
});
