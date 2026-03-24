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
      const res = await API.get("/hospitals");
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
          console.log("Location permission denied");
        },
      );
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return null;
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

  // ✅ Open location in Google Maps
  const openLocation = (lat, lng, name) => {
    // Open Google Maps with directions from current location
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}/`,
        "_blank",
      );
    } else {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  // ✅ Call hospital
  const handleCall = (phone, e) => {
    e.stopPropagation(); // Prevent card click when clicking call button
    window.location.href = `tel:${phone}`;
  };

  // ✅ Get directions
  const handleDirections = (lat, lng, e) => {
    e.stopPropagation(); // Prevent card click when clicking directions button
    openLocation(lat, lng);
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    if (filter === "emergency") return hospital.emergency === "24/7";
    return true;
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (userLocation) {
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
            <button onClick={() => navigate("/ambulance")}>Ambulance</button>
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
          <button onClick={() => navigate("/ambulance")}>Ambulance</button>
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
            const distance = userLocation
              ? getDistance(
                  userLocation.lat,
                  userLocation.lng,
                  hospital.latitude,
                  hospital.longitude,
                )
              : null;
            return (
              // ✅ Card click - Open location in Google Maps
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
                  <img src={hospital.image} alt={hospital.name} />
                  {hospital.emergency === "24/7" && (
                    <div className="emergency-tag">🚨 24/7</div>
                  )}
                </div>
                <div className="hospital-content">
                  <div className="hospital-header">
                    <h3>{hospital.name}</h3>
                    <div className="rating">
                      <FaStar /> {hospital.rating}
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
                      <FaBed /> {hospital.bedsAvailable} Beds
                    </div>
                    <div className="stat">
                      <FaAmbulance /> {hospital.ambulances} Ambulances
                    </div>
                    <div className="stat">
                      <FaClock /> {hospital.emergency}
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

// Hospitals with Images - 5 Hospitals

// Hospitals near Sector 63, Noida - Front photos with hospital name visible
const staticHospitals = [
  {
    name: "Fortis Hospital",
    address: "Sector 62, Noida, Uttar Pradesh 201301",
    phone: "+91-120-1234567",
    latitude: 28.6212,
    longitude: 77.3796,
    emergency: "24/7",
    rating: "4.8",
    bedsAvailable: 200,
    ambulances: 15,
    image:
      " https://static.medigence.com/uploads/hospital/images/1743589779_d82a39c45624d8d0abc9.jpg",
    distance: "2.5 km",
    travelTime: "8 mins",
  },
  {
    name: "Max Super Speciality Hospital",
    address: "Anand Vihar, Delhi - 110092",
    phone: "+91-11-12345678",
    latitude: 28.6457,
    longitude: 77.3179,
    emergency: "24/7",
    rating: "4.7",
    bedsAvailable: 180,
    ambulances: 12,
    image:
      "https://www.globalcarehealth.com/img/hospitalsimg/Max-Jaypee-Hospital-Noida-India-gchh93.webp",
    distance: "6.8 km",
    travelTime: "20 mins",
  },
  {
    name: "Kailash Hospital",
    address: "Sector 71, Noida, Uttar Pradesh 201301",
    phone: "+91-120-4567890",
    latitude: 28.5997,
    longitude: 77.4012,
    emergency: "24/7",
    rating: "4.5",
    bedsAvailable: 150,
    ambulances: 10,
    image: "https://images.unsplash.com/photo-1654762930571-dcf2ebc11542",
    distance: "3.2 km",
    travelTime: "10 mins",
  },
  {
    name: "Metro Hospital & Heart Institute",
    address: "Sector 12, Noida, Uttar Pradesh 201301",
    phone: "+91-120-9876543",
    latitude: 28.5856,
    longitude: 77.3181,
    emergency: "24/7",
    rating: "4.6",
    bedsAvailable: 220,
    ambulances: 18,
    image:
      "https://vaidam-images.s3.ap-southeast-1.amazonaws.com/webp/25/files/metro-hospitals-heart-institute-noida.webp",
    distance: "5.1 km",
    travelTime: "15 mins",
  },
  {
    name: "Yatharth Super Speciality Hospital",
    address: "Sector 110, Noida, Uttar Pradesh 201304",
    phone: "+91-120-7890123",
    latitude: 28.5789,
    longitude: 77.4215,
    emergency: "24/7",
    rating: "4.4",
    bedsAvailable: 300,
    ambulances: 20,
    image:
      "https://www.yatharthhospitals.com/uploads/pages/yatharth_62203518.jpg",
    distance: "4.5 km",
    travelTime: "12 mins",
  },

  {
    name: "Apollo Hospital",
    email: "hospitalalerts4@gmail.com",
    latitude: 28.5987,
    longitude: 77.2075,
    phone: "+91-11-98765432",
    address: "Sector 26, Noida, Uttar Pradesh - 201301",
    emergency: "24/7",
    rating: "4.8",
    bedsAvailable: 250,
    ambulances: 15,
    image: "https://medicaldialogues.in/h-upload/2021/10/26/162730-apollo-hospital.webp",
  },
];

export default Hospitals;
