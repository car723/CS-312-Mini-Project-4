import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/posts", { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/auth/signup",
        { user_id: userId, name, password },
        { withCredentials: true }
      );
      alert("Signup successful! Please sign in.");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  // Signin
  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/auth/signin",
        { user_id: userId, password },
        { withCredentials: true }
      );
      setIsLoggedIn(true);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.error || "Signin failed");
    }
  };

  // Logout
  const handleLogout = async () => {
    await axios.post("http://localhost:8000/auth/logout", {}, { withCredentials: true });
    setIsLoggedIn(false);
  };

  // Create or update post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    try {
      if (editingPostId) {
        // Update post
        await axios.put(
          `http://localhost:8000/posts/${editingPostId}`,
          { title, content },
          { withCredentials: true }
        );
        setEditingPostId(null);
      } else {
        // Create new post
        await axios.post(
          "http://localhost:8000/posts",
          { title, content },
          { withCredentials: true }
        );
      }
      setTitle("");
      setContent("");
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save post");
    }
  };

  // Edit a post
  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  // Delete a post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:8000/posts/${id}`, { withCredentials: true });
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete post");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Blog App</h1>

      {!isLoggedIn ? (
        <div>
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
            <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign Up</button>
          </form>

          <h2>Sign In</h2>
          <form onSubmit={handleSignin}>
            <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Sign In</button>
          </form>
        </div>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>

          <h2>{editingPostId ? "Edit Post" : "Create Post"}</h2>
          <form onSubmit={handleSubmitPost}>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
            <button type="submit">{editingPostId ? "Update Post" : "Create Post"}</button>
            {editingPostId && <button type="button" onClick={() => { setEditingPostId(null); setTitle(""); setContent(""); }}>Cancel</button>}
          </form>
        </div>
      )}

      <h2>Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        posts.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <small>Author: {p.author_name || p.author}</small>
            {isLoggedIn && (
              <div style={{ marginTop: "5px" }}>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default App;
