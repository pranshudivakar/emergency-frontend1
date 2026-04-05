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

  // ✅ Emergency Status States
  const [emergencyId, setEmergencyId] = useState(null);
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [hospitalsNotified, setHospitalsNotified] = useState([]);
  const [showStatus, setShowStatus] = useState(false);

  // Get user data on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      console.log("User Data Loaded:", JSON.parse(userData));
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

  // ✅ Polling for emergency status
  useEffect(() => {
    if (!emergencyId) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/api/emergency/status/${emergencyId}`);
        setEmergencyStatus(res.data.status);
        setHospitalsNotified(res.data.hospitalsNotified || []);

        // If accepted, fetch hospital details
        if (res.data.status === "accepted" && res.data.acceptedHospital) {
          const hospitalsRes = await API.get("/api/hospitals");
          const foundHospital = hospitalsRes.data.hospitals.find(
            (h) => h._id === res.data.acceptedHospital,
          );
          setHospital(foundHospital);
        }

        // If no longer pending, stop polling after some time
        if (res.data.status !== "pending") {
          setTimeout(() => {
            setShowStatus(false);
            setEmergencyId(null);
          }, 30000); // Hide after 30 seconds
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [emergencyId]);

  const sendEmergency = async () => {
    if (!navigator.geolocation) {
      setMessage("❌ Geolocation Not Supported");
      return;
    }

    setLoading(true);
    setMessage("");
    setMapLink("");
    setShowStatus(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const userId = localStorage.getItem("userId");
          const userData = JSON.parse(localStorage.getItem("user") || "{}");

          const emergencyData = {
            latitude,
            longitude,
            userId,
            name: userData.name || "Not provided",
            phone: userData.phone || "Not provided",
            email: userData.email || "Not provided",
          };

          console.log("Sending Emergency Data:", emergencyData);

          const res = await API.post("/api/emergency", emergencyData);

          // ✅ Set emergency ID for status tracking
          setEmergencyId(res.data.emergencyId);
          setShowStatus(true);
          setEmergencyStatus("pending");

          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setMapLink(mapsUrl);

          setMessage(`
🚨 EMERGENCY ALERT SENT SUCCESSFULLY!

👤 Name: ${userData.name || "Not provided"}
📞 Phone: ${userData.phone || "Not provided"}
📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
🏥 Hospital: ${res.data.hospitalNotified || "Nearest hospital"}

⏱️ Waiting for hospital response...
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

  // ✅ Cancel Emergency
  const cancelEmergency = () => {
    setEmergencyId(null);
    setShowStatus(false);
    setEmergencyStatus(null);
    setHospital(null);
    setMessage("");
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

          {/* ✅ Emergency Status Tracking Card */}
          {showStatus && emergencyStatus === "pending" && (
            <div className="emergency-status-card pending">
              <div className="pulse-icon">🚨</div>
              <h3>Contacting Hospital...</h3>
              <div className="status-spinner"></div>
              <p className="hospital-name">
                📍 Contacting:{" "}
                <strong>{hospitalsNotified[0] || "Searching..."}</strong>
              </p>
              <p>
                Please stay at your location. Hospital will call you shortly.
              </p>
              <button
                onClick={cancelEmergency}
                className="cancel-emergency-btn"
              >
                Cancel Emergency
              </button>
            </div>
          )}

          {showStatus && emergencyStatus === "accepted" && hospital && (
            <div className="emergency-status-card accepted">
              <div className="success-icon">✅</div>
              <h3>Ambulance Dispatched! 🚑</h3>
              <div className="hospital-details-status">
                <h4>🏥 {hospital.name}</h4>
                <p>📍 {hospital.address}</p>
                <p>
                  📞 <a href={`tel:${hospital.phone}`}>{hospital.phone}</a>
                </p>
                <p>
                  ⭐ Rating: {hospital.rating} | 🚑 {hospital.ambulances}{" "}
                  Ambulances
                </p>
              </div>
              <p className="eta">⏱️ Estimated Arrival: 8-10 minutes</p>
              <div className="action-buttons-status">
                <button
                  onClick={() => window.open(`tel:${hospital.phone}`)}
                  className="call-btn-status"
                >
                  📞 Call Hospital
                </button>
                <button
                  onClick={() => window.open(mapLink)}
                  className="location-btn-status"
                >
                  📍 Share Location
                </button>
              </div>
            </div>
          )}

          {showStatus && emergencyStatus === "no_hospitals" && (
            <div className="emergency-status-card no-hospitals">
              <div className="error-icon">❌</div>
              <h3>No Hospitals Available</h3>
              <p>All nearby hospitals are unable to respond.</p>
              <div className="emergency-contacts-status">
                <h4>📞 Call Emergency Services:</h4>
                <a href="tel:108" className="emergency-call-btn">
                  🚑 108 - Ambulance
                </a>
                <a href="tel:112" className="emergency-call-btn">
                  📞 112 - All Emergency
                </a>
              </div>
            </div>
          )}

          {/* Emergency Button */}
          <button
            onClick={sendEmergency}
            disabled={loading || (showStatus && emergencyStatus === "pending")}
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
          {message && !showStatus && (
            <div
              className={`message-box ${message.includes("SUCCESSFULLY") ? "success" : "error"}`}
            >
              {message}
            </div>
          )}

          {/* Map Link */}
          {mapLink && !showStatus && (
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
