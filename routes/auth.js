const express = require("express");
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const pool = req.app.locals.pool;
  const { user_id, password, name } = req.body;

  if (!user_id || !password || !name) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const exists = await pool.query("SELECT * FROM users WHERE user_id=$1", [user_id]);
    if (exists.rows.length > 0) return res.status(400).json({ error: "User ID already exists." });

    await pool.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", [
      user_id,
      password,
      name,
    ]);

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Database error. Please try again." });
  }
});

// Signin
router.post("/signin", async (req, res) => {
  const pool = req.app.locals.pool;
  const { user_id, password } = req.body;

  if (!user_id || !password) return res.status(400).json({ error: "User ID and password required." });

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id=$1 AND password=$2", [
      user_id,
      password,
    ]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid user ID or password." });

    req.session.user = { user_id: result.rows[0].user_id, name: result.rows[0].name };
    res.json({ message: "Signin successful", user: req.session.user });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Database error. Please try again." });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
