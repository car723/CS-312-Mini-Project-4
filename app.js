const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = 8000;

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blogdb",
  password: "Ninjago1125",
  port: 5432,
});
app.locals.pool = pool;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS for React frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Sessions
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
