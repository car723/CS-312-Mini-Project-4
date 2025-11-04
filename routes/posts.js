const express = require("express");
const router = express.Router();

// Check login
function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  return res.status(401).json({ error: "Unauthorized. Please sign in." });
}

// GET all posts
router.get("/", async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query(`
      SELECT posts.id, posts.title, posts.content, posts.author, users.name AS author_name
      FROM posts
      LEFT JOIN users ON posts.author = users.user_id
      ORDER BY posts.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// CREATE post
router.post("/", isLoggedIn, async (req, res) => {
  const pool = req.app.locals.pool;
  const { title, content } = req.body;
  const author = req.session.user?.user_id;

  if (!title || !content) return res.status(400).json({ error: "Title and content required." });

  try {
    const result = await pool.query(
      "INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING *",
      [title, content, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// UPDATE post
router.put("/:id", isLoggedIn, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) return res.status(400).json({ error: "Title and content required." });

  try {
    const result = await pool.query(
      "UPDATE posts SET title=$1, content=$2 WHERE id=$3 RETURNING *",
      [title, content, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Failed to update post." });
  }
});

// DELETE post
router.delete("/:id", isLoggedIn, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM posts WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found." });
    res.json({ message: "Post deleted successfully.", post: result.rows[0] });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

module.exports = router;
