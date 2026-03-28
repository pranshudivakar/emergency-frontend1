import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaStar, FaHospitalUser, FaClock } from "react-icons/fa";
import "./Doctors.css";

const Doctors = () => {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState("all");

  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiologist",
      hospital: "Fortis Hospital",
      experience: "15 years",
      phone: "+91-7524021510",
      availability: "9:00 AM - 5:00 PM",
      rating: 4.8,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      education: "MBBS, MD (Cardiology)",
    },
    {
      id: 2,
      name: "Dr. Priya Singh",
      specialization: "Neurologist",
      hospital: "Max Hospital",
      experience: "12 years",
      phone: "+91-9876543211",
      availability: "10:00 AM - 6:00 PM",
      rating: 4.9,
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      education: "MBBS, DM (Neurology)",
    },
    {
      id: 3,
      name: "Dr. Amit Sharma",
      specialization: "Orthopedist",
      hospital: "Kailash Hospital",
      experience: "10 years",
      phone: "+91-9876543212",
      availability: "9:30 AM - 5:30 PM",
      rating: 4.7,
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      education: "MBBS, MS (Orthopedics)",
    },
    {
      id: 4,
      name: "Dr. Neha Gupta",
      specialization: "Pediatrician",
      hospital: "Metro Hospital",
      experience: "8 years",
      phone: "+91-9876543213",
      availability: "11:00 AM - 7:00 PM",
      rating: 4.8,
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      education: "MBBS, MD (Pediatrics)",
    },
    {
      id: 5,
      name: "Dr. Vikram Mehta",
      specialization: "Gynecologist",
      hospital: "Yatharth Hospital",
      experience: "14 years",
      phone: "+91-9876543214",
      availability: "9:00 AM - 4:00 PM",
      rating: 4.9,
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      education: "MBBS, MS (Gynecology)",
    },
  ];

  const specialties = [
    "all",
    "Cardiologist",
    "Neurologist",
    "Orthopedist",
    "Pediatrician",
    "Gynecologist",
  ];

  const filteredDoctors =
    specialty === "all"
      ? doctors
      : doctors.filter((doc) => doc.specialization === specialty);

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="doctors-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          🏥 Emergency Healthcare
        </div>
        <div className="navLinks">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/hospitals")}>Hospitals</button>
          <button onClick={() => navigate("/doctors")} className="active">
            Doctors
          </button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>👨‍⚕️ Our Expert Doctors</h1>
        <p>Find the best specialists near you</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        {specialties.map((spec) => (
          <button
            key={spec}
            className={`filter-btn ${specialty === spec ? "active" : ""}`}
            onClick={() => setSpecialty(spec)}
          >
            {spec === "all" ? "All" : spec}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-image">
              <img src={doctor.image} alt={doctor.name} />
            </div>
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p className="specialization">{doctor.specialization}</p>
              <p className="hospital">
                <FaHospitalUser /> {doctor.hospital}
              </p>
              <p className="experience">🎓 {doctor.experience} experience</p>
              <p className="education">📚 {doctor.education}</p>
              <p className="availability">
                <FaClock /> {doctor.availability}
              </p>
              <div className="rating">
                <FaStar /> {doctor.rating}
              </div>
              <button
                className="call-btn"
                onClick={() => handleCall(doctor.phone)}
              >
                <FaPhone /> Call Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
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

export default Doctors;
