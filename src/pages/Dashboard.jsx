import React, { useState, useEffect, useRef } from "react";
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
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Emergency Status States
  const [emergencyId, setEmergencyId] = useState(null);
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [hospitalsNotified, setHospitalsNotified] = useState([]);
  const [showStatus, setShowStatus] = useState(false);
  const [hospitalNotifiedName, setHospitalNotifiedName] = useState("");

  // Get user data on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationActive(result.state === "granted");
      });
    }
  }, []);


  const enableAudio = () => {
    if (audioRef.current && !audioEnabled) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioEnabled(true);
          console.log("🔊 Audio enabled");
        })
        .catch((err) => {
          console.log("Audio enable failed:", err);
        });
    }
  };
  const playRingtone = () => {
    if (audioRef.current && audioEnabled && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          console.log("🔔 Ringtone playing...");
        })
        .catch((error) => {
          console.error("❌ Audio play failed:", error);
        });
    }
  };
  const stopRingtone = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      console.log("🔕 Ringtone stopped");
    }
  };

  useEffect(() => {
    if (
      showStatus &&
      (emergencyStatus === "pending" || emergencyStatus === "accepted")
    ) {
      playRingtone();
    } else {
      stopRingtone();
    }
  }, [showStatus, emergencyStatus, audioEnabled]);

  useEffect(() => {
    if (!emergencyId) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/api/emergency/status/${emergencyId}`);
        setEmergencyStatus(res.data.status);
        setHospitalsNotified(res.data.hospitalsNotified || []);

        if (res.data.status === "accepted" && res.data.acceptedHospital) {
          const hospitalsRes = await API.get("/api/hospitals");
          const foundHospital = hospitalsRes.data.hospitals.find(
            (h) => h._id === res.data.acceptedHospital,
          );
          setHospital(foundHospital);
          setShowStatus(true);
        }

        if (res.data.status === "pending" && res.data.hospitalsNotified) {
          setHospitalsNotified(res.data.hospitalsNotified);
        }

        if (res.data.status === "no_hospitals") {
          setShowStatus(true);
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
    setHospital(null);
    setEmergencyStatus(null);

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

          const res = await API.post("/api/emergency", emergencyData);

          setEmergencyId(res.data.emergencyId);
          setShowStatus(true);
          setEmergencyStatus("pending");
          setHospitalNotifiedName(
            res.data.hospitalNotified || "Nearest hospital",
          );

          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setMapLink(mapsUrl);

          setMessage(
            `🚨 EMERGENCY ALERT SENT! Waiting for hospital response...`,
          );
          setLocationActive(true);

          playRingtone();
        } catch (error) {
          setMessage(error.response?.data?.message || "❌ Server Error");
          setShowStatus(false);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setLocationActive(false);
        let errorMsg = "❌ Location Permission Denied";
        if (err.code === 1) {
          errorMsg = "❌ Please enable location access for emergency alerts";
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

  const cancelEmergency = () => {
    setEmergencyId(null);
    setShowStatus(false);
    setEmergencyStatus(null);
    setHospital(null);
    setMessage("");
    stopRingtone();
  };

  return (
    <div className="dashboard-page" onClick={enableAudio}>

      <audio ref={audioRef} loop preload="auto">
        <source
          src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
          type="audio/mpeg"
        />
        <source
          src="https://actions.google.com/sounds/447/alarm-clock-short.mp3"
          type="audio/mpeg"
        />
      </audio>

    
      {!audioEnabled && (
        <div className="audio-enable-banner">
          <button onClick={enableAudio}>
            🔔 Click to Enable Emergency Sound
          </button>
        </div>
      )}

      {/* Navbar with User Details */}
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
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* Rest of your dashboard code remains same */}
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h2>🚑 Emergency Dashboard</h2>

          <div
            className={`location-status ${locationActive ? "active" : "inactive"}`}
          >
            {locationActive
              ? "📍 Location Active"
              : "📍 Location Inactive - Enable for emergency"}
          </div>

          {/* Emergency Status Tracking */}
          {showStatus && emergencyStatus === "pending" && (
            <div className="emergency-status-card pending">
              <div className="pulse-icon">🚨</div>
              <h3>Contacting Hospital...</h3>
              <div className="status-spinner"></div>
              <p className="hospital-name">
                📍 Contacting:{" "}
                <strong>
                  {hospitalsNotified[hospitalsNotified.length - 1] ||
                    hospitalNotifiedName ||
                    "Searching..."}
                </strong>
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

          {/* ACCEPTED - Ambulance Dispatched */}
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

          {/* FORWARDED to next hospital */}
          {showStatus &&
            emergencyStatus === "pending" &&
            hospitalsNotified.length > 1 && (
              <div className="emergency-status-card forwarded">
                <div className="warning-icon">⚠️</div>
                <h3>Forwarded to Another Hospital</h3>
                <p>
                  Previous hospital couldn't respond. Contacting next
                  hospital...
                </p>
                <p className="hospital-name">
                  📍 Now Contacting:{" "}
                  <strong>
                    {hospitalsNotified[hospitalsNotified.length - 1]}
                  </strong>
                </p>
              </div>
            )}

          {/* NO HOSPITALS AVAILABLE */}
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
              className={`message-box ${message.includes("SENT") ? "success" : "error"}`}
            >
              <p>{message}</p>
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