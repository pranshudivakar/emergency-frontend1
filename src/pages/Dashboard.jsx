import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapLink, setMapLink] = useState("");
  const [user, setUser] = useState(null);
  const [locationActive, setLocationActive] = useState(false);

  // Get user data on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      console.log("User Data Loaded:", JSON.parse(userData)); // Debug
    }
  }, []);

  // Check location permission
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationActive(result.state === "granted");
      });
    }
  }, []);

  const sendEmergency = async () => {
    if (!navigator.geolocation) {
      setMessage("❌ Geolocation Not Supported");
      return;
    }

    setLoading(true);
    setMessage("");
    setMapLink("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const userId = localStorage.getItem("userId");

          // ✅ Get user data from localStorage
          const userData = JSON.parse(localStorage.getItem("user") || "{}");

          // ✅ Prepare emergency data with user name and phone
          const emergencyData = {
            latitude,
            longitude,
            userId,
            name: userData.name || "Not provided", // ✅ User name
            phone: userData.phone || "Not provided", // ✅ User phone number
            email: userData.email || "Not provided", // ✅ User email (optional)
          };

          console.log("Sending Emergency Data:", emergencyData); // Debug

          const res = await API.post("/emergency", emergencyData);

          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setMapLink(mapsUrl);

          // ✅ Show user details in success message
          setMessage(`
🚨 EMERGENCY ALERT SENT SUCCESSFULLY!

👤 Name: ${userData.name || "Not provided"}
📞 Phone: ${userData.phone || "Not provided"}
📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
🏥 Hospitals Notified: ${res.data.hospitalsNotified?.length || "All nearby"} hospitals

⏱️ Help is on the way! Hospital will call you shortly.
          `);

          setLocationActive(true);
        } catch (error) {
          console.error("Emergency Error:", error);
          setMessage(
            error.response?.data?.message ||
              "❌ Server Error — Emergency Not Sent",
          );
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setLocationActive(false);
        let errorMsg = "❌ Location Permission Denied";
        if (err.code === 1) {
          errorMsg =
            "❌ Location Permission Denied. Please enable location access for emergency alerts.";
        } else if (err.code === 2) {
          errorMsg = "❌ Location unavailable. Please try again.";
        }
        setMessage(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          🏥 Emergency Healthcare
        </div>
        <div className="navLinks">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/hospitals")}>Hospitals</button>
          <button onClick={() => navigate("/doctors")}>Doctors</button>

          {user ? (
            <>
              <div className="user-profile">
                <span>👤 {user.name || "User"}</span>
                <span className="user-phone">
                  📞 {user.phone || "No phone"}
                </span>
              </div>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* Main Dashboard */}
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h2>🚑 Emergency Dashboard</h2>

          {/* ✅ User Info Card */}
          {user && (
            <div className="user-info-card">
              <h3>👤 Your Information</h3>
              <div className="user-details">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone || "Not provided"}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Location Status */}
          <div
            className={`location-status ${locationActive ? "active" : "inactive"}`}
          >
            {locationActive
              ? "📍 Location Active"
              : "📍 Location Inactive - Enable for emergency"}
          </div>

          {/* Emergency Button */}
          <button
            onClick={sendEmergency}
            disabled={loading}
            className="emergency-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                SENDING ALERT...
              </>
            ) : (
              "🚨 EMERGENCY BUTTON"
            )}
          </button>

          {/* Message Box */}
          {message && (
            <div
              className={`message-box ${message.includes("SUCCESSFULLY") ? "success" : "error"}`}
            >
              {message}
            </div>
          )}

          {/* Map Link */}
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="map-btn"
            >
              📍 Open Location in Google Maps
            </a>
          )}

          {/* Emergency Tips */}
          <div className="emergency-tips">
            <p>⚠️ Press only in real emergency</p>
            <p>
              📍 Your location and contact info will be shared with nearby
              hospitals
            </p>
            <p>📞 Hospitals will call you within 2-3 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
