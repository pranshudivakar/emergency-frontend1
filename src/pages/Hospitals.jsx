import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaAmbulance,
  FaBed,
  FaClock,
  FaDirections,
} from "react-icons/fa";
import API from "../services/api";
import "./Hospitals.css";

const Hospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHospitals();
    getUserLocation();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await API.get("/api/hospitals");
      console.log("Hospitals fetched:", res.data);
      if (res.data.hospitals && res.data.hospitals.length > 0) {
        setHospitals(res.data.hospitals);
      } else {
        setHospitals(staticHospitals);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setHospitals(staticHospitals);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location permission denied:", error);
          setUserLocation({
            lat: 28.6212, // 
            lng: 77.3796,
          });
          
          alert(
            "⚠️ Location access denied. Using default location (Noida Sector 62).\n\nTo enable, click the lock icon in address bar and allow location.",
          );
        },
      );
    } else {
      // Browser doesn't support geolocation
      setUserLocation({
        lat: 28.6212,
        lng: 77.3796,
      });
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const openLocation = (lat, lng, name) => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}/`,
        "_blank",
      );
    } else {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  const handleCall = (phone, e) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (lat, lng, e) => {
    e.stopPropagation();
    openLocation(lat, lng);
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    if (filter === "emergency") return hospital.emergency === "24/7";
    return true;
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (userLocation && a.latitude && b.latitude) {
      const distA = getDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude,
      );
      const distB = getDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude,
      );
      return (distA || 999) - (distB || 999);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="hospitals-page">
        <nav className="navbar">
          <div className="logo" onClick={() => navigate("/")}>
            🏥 Emergency Healthcare
          </div>
          <div className="navLinks">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/hospitals")} className="active">
              Hospitals
            </button>
            <button onClick={() => navigate("/doctors")}>Doctors</button>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </div>
        </nav>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hospitals-page">
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          🏥 Emergency Healthcare
        </div>
        <div className="navLinks">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/hospitals")} className="active">
            Hospitals
          </button>
          <button onClick={() => navigate("/doctors")}>Doctors</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      <div className="hero-section">
        <h1>🏥 Nearby Hospitals</h1>
        <p>Click on any hospital card to get directions</p>
      </div>

      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Hospitals
        </button>
        <button
          className={`filter-btn ${filter === "emergency" ? "active" : ""}`}
          onClick={() => setFilter("emergency")}
        >
          🚨 24/7 Emergency
        </button>
        {userLocation && (
          <div className="location-badge">
            📍 Showing hospitals near your location
          </div>
        )}
      </div>

      <div className="hospitals-grid">
        {sortedHospitals.length === 0 ? (
          <div className="no-data">
            <p>No hospitals found</p>
          </div>
        ) : (
          sortedHospitals.map((hospital, index) => {
            const distance =
              userLocation && hospital.latitude
                ? getDistance(
                    userLocation.lat,
                    userLocation.lng,
                    hospital.latitude,
                    hospital.longitude,
                  )
                : null;
            return (
              <div
                key={hospital._id || index}
                className="hospital-card"
                onClick={() =>
                  openLocation(
                    hospital.latitude,
                    hospital.longitude,
                    hospital.name,
                  )
                }
              >
                <div className="hospital-image">
                  <img
                    src={
                      hospital.image ||
                      "https://via.placeholder.com/300x200?text=Hospital"
                    }
                    alt={hospital.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Hospital";
                    }}
                  />
                  {hospital.emergency === "24/7" && (
                    <div className="emergency-tag">🚨 24/7</div>
                  )}
                </div>
                <div className="hospital-content">
                  <div className="hospital-header">
                    <h3>{hospital.name}</h3>
                    <div className="rating">
                      <FaStar /> {hospital.rating || "4.5"}
                    </div>
                  </div>
                  <p className="address">
                    <FaMapMarkerAlt /> {hospital.address}
                  </p>
                  {distance && (
                    <p className="distance">
                      📍 {distance} km away • {Math.round(distance * 2)} min
                      drive
                    </p>
                  )}
                  <div className="hospital-stats">
                    <div className="stat">
                      <FaBed /> {hospital.bedsAvailable || "N/A"} Beds
                    </div>
                    <div className="stat">
                      <FaAmbulance /> {hospital.ambulances || "N/A"} Ambulances
                    </div>
                    <div className="stat">
                      <FaClock /> {hospital.emergency || "24/7"}
                    </div>
                  </div>
                  <div className="hospital-actions">
                    <button
                      className="call-btn"
                      onClick={(e) => handleCall(hospital.phone, e)}
                    >
                      <FaPhone /> Call Now
                    </button>
                    <button
                      className="directions-btn"
                      onClick={(e) =>
                        handleDirections(
                          hospital.latitude,
                          hospital.longitude,
                          e,
                        )
                      }
                    >
                      <FaDirections /> Directions
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 Smart Emergency Healthcare System. All rights reserved.</p>
          <div className="footer-emergency">
            <span>🚨 24/7 Emergency: 108</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ✅ Fixed Static Hospitals with working images
const staticHospitals = [
  {
    name: "Fortis Hospital",
    address: "Sector 62, Noida, Uttar Pradesh 201301",
    phone: "+91-7524021510",
    latitude: 28.6212,
    longitude: 77.3796,
    email: "hospitalalerts4@gmail.com",
    emergency: "24/7",
    rating: "4.8",
    bedsAvailable: 200,
    ambulances: 15,
    image:
      "https://static.medigence.com/uploads/hospital/images/1743589779_d82a39c45624d8d0abc9.jpg"
  },
  {
    name: "Max Super Speciality Hospital",
    address: "Anand Vihar, Delhi - 110092",
    phone: "+91-11-12345678",
    latitude: 28.6457,
    longitude: 77.3179,
    email: "p46415053@gmail.com",
    emergency: "24/7",
    rating: "4.7",
    bedsAvailable: 180,
    ambulances: 12,
    image:
      "https://content.jdmagicbox.com/v2/comp/delhi/z4/011pxx11.xx11.250817081712.b4z4/catalogue/max-super-speciality-hospital-shalimar-bagh-delhi-5ek1ur7cxs.jpg"
  },
  {
    name: "Kailash Hospital",
    address: "Sector 71, Noida, Uttar Pradesh 201301",
    phone: "+91-120-4567890",
    latitude: 28.5997,
    longitude: 77.4012,
    email: "pranshupranshu92153@gmail.com",
    emergency: "24/7",
    rating: "4.5",
    bedsAvailable: 150,
    ambulances: 10,
    image:
      "https://www.kailashhealthcare.com/Content/images/GH-H-doon-Thumb.png"
  },
  {
    name: "Metro Hospital & Heart Institute",
    address: "Sector 12, Noida, Uttar Pradesh 201301",
    phone: "+91-120-9876543",
    latitude: 28.5856,
    longitude: 77.3181,
    email: "hospitalalerts4@gmail.com",
    emergency: "24/7",
    rating: "4.6",
    bedsAvailable: 220,
    ambulances: 18,
    image:
      "https://i.ytimg.com/vi/yWsXj_-VfVM/sddefault.jpg"
  },
  {
    name: "Yatharth Super Speciality Hospital",
    address: "Sector 110, Noida, Uttar Pradesh 201304",
    phone: "+91-120-7890123",
    latitude: 28.5789,
    longitude: 77.4215,
    email: "pranshu.diwakar.739914@gmail.com",
    emergency: "24/7",
    rating: "4.4",
    bedsAvailable: 300,
    ambulances: 20,
    image:
      "https://www.yatharthhospitals.com/uploads/hostmaster/yatharth_53830047.jpg"
  },
  {
    name: "Apollo Hospital",
    address: "Sector 26, Noida, Uttar Pradesh - 201301",
    phone: "+91-11-98765432",
    latitude: 28.5987,
    longitude: 77.2075,
    email: "hospitalalerts4@gmail.com",
    emergency: "24/7",
    rating: "4.8",
    bedsAvailable: 250,
    ambulances: 15,
    image:
      "https://bsmedia.business-standard.com/_media/bs/img/article/2025-04/07/full/1744000876-7812.jpg?im=FitAndFill=(382,233)"
  },
];

export default Hospitals;
