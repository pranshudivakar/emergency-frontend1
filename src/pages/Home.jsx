import { useNavigate } from "react-router-dom";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";
import { useState, useEffect } from "react";

import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setUser(null);
    alert("✅ Logout successful!");
    navigate("/");
  };

  // Handle Emergency
  const handleEmergency = () => {
    setLoading(true);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Emergency Location:", latitude, longitude);

          // Here you can send this location to your backend
          // API.post("/emergency", { lat: latitude, lng: longitude });

          alert("🚨 Emergency alert sent! Hospital will contact you soon.");
          setLoading(false);
          navigate("/emergency-dashboard");
        },
        (error) => {
          alert("❌ Location access needed for emergency!");
          setLoading(false);
        },
      );
    } else {
      alert("❌ Geolocation not supported!");
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Ambulance Animation */}
      <div className="ambulance-animation">🚑 🚨 🚑</div>
      {/* Header / Navbar */}
      <header className="home-header">
        <h1>
          <span className="logo-icon">🏥</span>
          Smart Emergency Healthcare
        </h1>

        <nav>
          <button onClick={() => navigate("/home")} className="active">
            🏠 Home
          </button>
          <button onClick={() => navigate("/hospitals")}>🏨 Hospitals</button>
          <button onClick={() => navigate("/doctors")}>👨‍⚕️ Doctors</button>
          <button onClick={() => navigate("/ambulance")}>🚑 Ambulance</button>

          {user ? (
            <>
              <button className="profile-btn">👤 {user.name || "User"}</button>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>🔐 Login</button>
              <button onClick={() => navigate("/register")}>📝 Register</button>
            </>
          )}
        </nav>
      </header>
      {/* Main Content */}
      <main className="home-main">
        <h2>🚨Smart Emergency Healthcare</h2>

        <p>
          {user
            ? `Welcome back, ${user.name || "User"}!`
            : "Your location will be sent to nearby hospitals"}
        </p>

        {/* Emergency Button */}
        <button
          onClick={handleEmergency}
          className="emergency-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Sending Alert...
            </>
          ) : (
            "🚨 EMERGENCY BUTTON"
          )}
        </button>

        {/* Location Badge */}
        <div className="location-badge">
          <span>📍 Auto-detect location active</span>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Hospitals</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">200+</span>
            <span className="stat-label">Doctors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Patients Saved</span>
          </div>
        </div>
      </main>
      // Footer section exactly aise rahega:
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

export default Home;
