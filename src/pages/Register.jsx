import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";
import API from "../services/api";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
    disease: "",
    medication: "",
    emergencyName: "",
    emergencyPhone: "",
    relationship: "",
  });

  // Validation Functions
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!form.name) newErrors.name = "Name required hai";
      if (!form.email) newErrors.email = "Email required hai";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Sahi email daalo";
      if (!form.password) newErrors.password = "Password required hai";
      else if (form.password.length < 6)
        newErrors.password = "Password 6 characters ka ho";
      if (!form.phone) newErrors.phone = "Phone required hai";
      else if (!/^\d{10}$/.test(form.phone))
        newErrors.phone = "10 digits ka phone number daalo";
    }

    if (step === 3) {
      if (!form.emergencyName)
        newErrors.emergencyName = "Emergency contact name required";
      if (!form.emergencyPhone)
        newErrors.emergencyPhone = "Emergency phone required";
      else if (!/^\d{10}$/.test(form.emergencyPhone))
        newErrors.emergencyPhone = "10 digits ka phone number daalo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);
      console.log("Registration Success:", res.data);

      alert("✅ Registration Successful! Ab login karo");
      navigate("/login");
    } catch (error) {
      console.log("Register Error:", error);
      const msg = error.response?.data?.message || "❌ Registration Failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          🏥 Emergency Healthcare
        </div>

        <div className="navLinks">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/hospitals")}>Hospitals</button>
          <button onClick={() => navigate("/doctors")}>Doctors</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="active">Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>📝 Patient Registration</h1>
        <p>Emergency ke liye apni medical information save karo</p>
      </div>

      {/* Registration Form */}
      <div className="registerContainer">
        <form onSubmit={handleSubmit} className="registerForm">
          <h2>🚀 Register</h2>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className={`progress-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}
            >
              1
            </div>
            <div
              className={`progress-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}
            >
              2
            </div>
            <div
              className={`progress-step ${currentStep >= 3 ? "active" : ""}`}
            >
              3
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <>
              <h3>🟢 Personal Information</h3>

              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? "error" : ""}
                required
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? "error" : ""}
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}

              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={errors.password ? "error" : ""}
                required
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}

              <input
                placeholder="Phone Number (10 digits)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={errors.phone ? "error" : ""}
                required
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}

              <div className="form-row">
                <input
                  placeholder="Age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />

                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button type="button" onClick={nextStep} className="next-btn">
                Next →
              </button>
            </>
          )}

          {/* Step 2: Medical Information */}
          {currentStep === 2 && (
            <>
              <h3>🔵 Medical Information</h3>

              <input
                placeholder="Blood Group (e.g., O+, A+)"
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm({ ...form, bloodGroup: e.target.value })
                }
              />

              <input
                placeholder="Allergies (e.g., Penicillin, Dust)"
                value={form.allergies}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
              />

              <input
                placeholder="Existing Diseases (e.g., Diabetes, BP)"
                value={form.disease}
                onChange={(e) => setForm({ ...form, disease: e.target.value })}
              />

              <input
                placeholder="Current Medications"
                value={form.medication}
                onChange={(e) =>
                  setForm({ ...form, medication: e.target.value })
                }
              />

              <div className="form-row">
                <button type="button" onClick={prevStep} className="prev-btn">
                  ← Previous
                </button>
                <button type="button" onClick={nextStep} className="next-btn">
                  Next →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <>
              <h3>🟡 Emergency Contact</h3>

              <input
                placeholder="Emergency Contact Name"
                value={form.emergencyName}
                onChange={(e) =>
                  setForm({ ...form, emergencyName: e.target.value })
                }
                className={errors.emergencyName ? "error" : ""}
                required
              />
              {errors.emergencyName && (
                <span className="error-message">{errors.emergencyName}</span>
              )}

              <input
                placeholder="Emergency Contact Phone (10 digits)"
                value={form.emergencyPhone}
                onChange={(e) =>
                  setForm({ ...form, emergencyPhone: e.target.value })
                }
                className={errors.emergencyPhone ? "error" : ""}
                required
              />
              {errors.emergencyPhone && (
                <span className="error-message">{errors.emergencyPhone}</span>
              )}

              <input
                placeholder="Relationship (e.g., Father, Mother, Friend)"
                value={form.relationship}
                onChange={(e) =>
                  setForm({ ...form, relationship: e.target.value })
                }
              />

              <div className="form-row">
                <button type="button" onClick={prevStep} className="prev-btn">
                  ← Previous
                </button>

                <button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Registering...
                    </>
                  ) : (
                    "Complete Registration ✅"
                  )}
                </button>
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="loginLink">
            Already have an account?
            <span onClick={() => navigate("/login")}> Login here</span>
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

export default Register;
