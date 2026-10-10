import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

function Navbar({ favCount = 0, isLoggedIn = false, tenantProfile, roomsCount = 0, requestsCount = 0, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFirstName = () => {
    if (tenantProfile && tenantProfile.fullName) {
      return tenantProfile.fullName.trim().split(" ")[0];
    }
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.username) {
          return u.username.charAt(0).toUpperCase() + u.username.slice(1);
        }
      } catch (e) {}
    }
    return "User";
  };

  const getFullName = () => {
    if (tenantProfile && tenantProfile.fullName) {
      return tenantProfile.fullName;
    }
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        return u.fullName || u.username || "SweetHome User";
      } catch (e) {}
    }
    return "SweetHome User";
  };

  const getUsername = () => {
    if (tenantProfile && tenantProfile.username) {
      return tenantProfile.username;
    }
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        return u.username || "user";
      } catch (e) {}
    }
    return "user";
  };

  const handleTabClick = (tabName) => {
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/profile", { state: { activeTab: tabName } });
  };

  const handleListRoomClick = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/addroom");
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🏠</span>
          <span className="logo-text">SweetHome</span>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Nav Links */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}
              onClick={() => setMenuOpen(false)}>Explore Rooms</Link>
          </li>
          <li>
            <Link to="/renters" className={isActive("/renters") ? "nav-link active" : "nav-link"}
              onClick={() => setMenuOpen(false)}>Renters</Link>
          </li>
          <li>
            <Link to="/favorites" className={isActive("/favorites") ? "nav-link active" : "nav-link"}
              onClick={() => setMenuOpen(false)}>
              Favorites ♡
              {favCount > 0 && <span className="nav-fav-badge">{favCount}</span>}
            </Link>
          </li>
          <li>
            <Link to="/addroom" className={isActive("/addroom") ? "nav-link active" : "nav-link"}
              onClick={() => setMenuOpen(false)}>+ List a Room</Link>
          </li>

          {/* Profile - visible in mobile menu too when logged in */}
          {isLoggedIn && (
            <li className="profile-mobile">
              <button onClick={() => handleTabClick("profile")} className="nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                👤 My Profile
              </button>
              <button onClick={() => handleTabClick("myrooms")} className="nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                🏠 My Rooms ({roomsCount})
              </button>
              <button onClick={() => { setMenuOpen(false); navigate("/incoming-requests"); }} className="nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                📥 Incoming Requests
              </button>
              <button onClick={() => { setMenuOpen(false); navigate("/my-requests"); }} className="nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                📨 My Requests
              </button>
              <button onClick={handleLogoutClick} className="nav-link" style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", color: "#ff4d4d" }}>
                🚪 Logout
              </button>
            </li>
          )}
        </ul>

        {/* Profile Dropdown or Login - top right desktop */}
        {isLoggedIn ? (
          <div className="nav-profile-wrapper" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="nav-profile-toggle"
              aria-expanded={dropdownOpen}
            >
              👤 {getFirstName()} ▾
            </button>
            {dropdownOpen && (
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-user-info">
                  <div className="nav-dropdown-fullname">{getFullName()}</div>
                  <div className="nav-dropdown-username">@{getUsername()}</div>
                </div>
                <div className="nav-dropdown-divider"></div>
                <button className="nav-dropdown-item" onClick={() => handleTabClick("profile")}>
                  <span className="nav-dropdown-icon">👤</span> My Profile
                </button>
                <button className="nav-dropdown-item" onClick={() => handleTabClick("myrooms")}>
                  <span className="nav-dropdown-icon">🏠</span> My Rooms
                  <span className="nav-dropdown-count">{roomsCount}</span>
                </button>
                <button className="nav-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/incoming-requests"); }}>
                  <span className="nav-dropdown-icon">📥</span> Incoming Requests
                </button>
                <button className="nav-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/my-requests"); }}>
                  <span className="nav-dropdown-icon">📨</span> My Requests
                </button>
                <div className="nav-dropdown-divider"></div>
                <button className="nav-dropdown-item" onClick={handleListRoomClick}>
                  <span className="nav-dropdown-icon">＋</span> List a Room
                </button>
                <div className="nav-dropdown-divider"></div>
                <button className="nav-dropdown-item logout-item" onClick={handleLogoutClick}>
                  <span className="nav-dropdown-icon">🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to="/login" 
            className="nav-login-btn" 
            style={{
              textDecoration: "none",
              background: "#4db8ff",
              color: "#0a1628",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.target.style.background = "#3aa7eb"; }}
            onMouseLeave={(e) => { e.target.style.background = "#4db8ff"; }}
          >
            🔑 Login
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
