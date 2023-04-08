import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "ecommerce",
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.json("connected to database");
});

// USERS OPERATIONS
app.get("/users", (req, res) => {
  const q = "SELECT * FROM users";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/user/:id", (req, res) => {
  const q = "SELECT * FROM users WHERE user_id = ?";
  const id = req.params.id;
  db.query(q, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/addUser", (req, res) => {
  const q =
    "INSERT INTO users (first_name, last_name, mobile_no, email, password, gender) VALUES (?)";
  const values = [
    req.body.firstName,
    req.body.lastName,
    req.body.mobile,
    req.body.email,
    req.body.password,
    req.body.gender,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// PRODUCTS OPERATIONS
app.get("/products", (req, res) => {
  const q = "SELECT * FROM products";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/product/:id", (req, res) => {
  const q = "SELECT * FROM products WHERE product_id = ?";
  const id = req.params.id;
  db.query(q, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// ORDERS OPERATIONS

app.get("/orders", (req, res) => {
  const q = "SELECT * FROM orders";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/order/:id", (req, res) => {
  const q = "SELECT * FROM orders WHERE id = ?";
  const id = req.params.id;
  db.query(q, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// app.put("/orderStatus/:id", (req, res) => {
//   const q = "UPDATE orders SET order_status = 'CANCELED' WHERE id = ?";
//   const id = req.params.id;
//   db.query(q, [id], (err, data) => {
//     if (err) return res.json(err);
//     return res.json(data);
//   });
// });

app.post("/addOrder", (req, res) => {
  const q =
    "INSERT INTO users (product_name, order_status, payment_status, product_id, user_id, quantity) VALUES (?)";
  const values = [
    req.body.productName,
    req.body.orderStatus,
    req.body.paymentStatus,
    req.body.productId,
    req.body.userId,
    req.body.quantity,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.put("/addAddress/:id", (req, res) => {
  const q = "UPDATE orders SET address = ? WHERE id = ?";
  const id = req.params.id;
  const address = [req.body.address];
  db.query(q, [address, id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.put("/cancelOrder/:id", (req, res) => {
  const q = "UPDATE orders SET order_status = ? WHERE id = ?";
  const id = req.params.id;
  const orderStatus = [req.body.orderStatus];
  db.query(q, [address, id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.listen(8080, () => {
  console.log("connected to backend!");
});
