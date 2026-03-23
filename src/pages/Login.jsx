import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";
import API from "../services/api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      // ✅ IMPORTANT: Save full user data with name and phone number
      const userData = {
        name: res.data.user.name,
        email: res.data.user.email,
        phone: res.data.user.phone, // ✅ Phone number save
        userId: res.data.user._id,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("User Data Saved:", userData); // Debug ke liye

      alert("✅ Login Successful");
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "❌ Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* ===== Navbar ===== */}
      <nav className="navbar">
        <div className="logo">🚑 Emergency System</div>

        <div className="navLinks">
          <button onClick={() => navigate("/home")}>Home</button>
          <button onClick={() => navigate("/register")}>Register</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      {/* ===== Hero Heading ===== */}
      <div className="hero">
        <h1>Smart Emergency Healthcare System</h1>
        <p>Instant alert system for hospitals during emergencies</p>
      </div>

      {/* ===== Login Form ===== */}
      <div className="loginContainer">
        <form onSubmit={handleLogin} className="loginCard">
          <h2>🔐 Login</h2>

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" disabled={loading}>
            {loading ? "⏳ Logging In..." : "Login"}
          </button>

          <p className="registerLink">
            Don't have an account?
            <span onClick={() => navigate("/register")}> Register</span>
          </p>
        </form>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 Smart Emergency Healthcare System. All rights reserved.</p>

          {/* Emergency Contact Badge */}
          <div className="footer-emergency">
            <span>🚨 24/7 Emergency: 108</span>
          </div>

          {/* Social Icons */}
          <div className="social-icons">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              title="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              title="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              title="Facebook"
            >
              <FaFacebook />
            </a>
          </div>

          {/* Quick Links (Optional) */}
          <div className="footer-links">
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms & Conditions</a>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            Made with ❤️ for Emergency Healthcare
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
