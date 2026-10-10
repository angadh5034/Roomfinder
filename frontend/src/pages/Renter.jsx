import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Renter.css";
import AgreementModal from "../components/AgreementModal";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

// ── Renter Card Component ──
function RenterCard({ renter }) {
  const [showAdhar, setShowAdhar] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const name = renter.renterName || renter.name || "Tenant";
  const contact = renter.renterContact || renter.contact || "N/A";
  const adharNumber = renter.adharNumber || "N/A";
  const startDate = renter.startDate || renter.rentFrom || "N/A";
  const endDate = renter.endDate || renter.rentTo || "N/A";
  const duration = renter.duration || "6 Months";
  const status = renter.status || "Active";
  const isActive = status.toLowerCase() === "active";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roomData = {
    title: renter.roomTitle,
    location: `${renter.city || ""}`,
    rent: renter.rent,
    rentType: renter.rentType,
    photo: renter.roomPhoto,
  };

  const renterDataForModal = {
    name,
    contact,
    adharNumber,
    rentFrom: startDate,
    rentTo: endDate,
    adharFront: renter.adharFront,
    adharBack: renter.adharBack,
  };

  return (
    <div className="renter-card">
      {showAgreement && (
        <AgreementModal
          renter={renterDataForModal}
          room={roomData}
          onClose={() => setShowAgreement(false)}
        />
      )}
      <div className="renter-top">
        <div className="renter-avatar">{initials}</div>
        <div className="renter-info">
          <div className="renter-name">{name}</div>
          <div className="renter-contact">📞 {contact}</div>
          <div className="renter-adhar-num">🪪 {adharNumber}</div>
        </div>
        <span className={`renter-status ${isActive ? "rent-active" : "rent-expired"}`}>
          {isActive ? "● Active" : "● Completed"}
        </span>
      </div>

      <div className="renter-period">
        <div className="period-item">
          <span className="period-label">From</span>
          <span className="period-val">{formatDate(startDate)}</span>
        </div>
        <div className="period-arrow">→</div>
        <div className="period-item">
          <span className="period-label">To</span>
          <span className="period-val">{formatDate(endDate)}</span>
        </div>
        <div className="period-badge">{duration}</div>
      </div>

      {(renter.adharFront || renter.adharBack) && (
        <>
          <button className="adhar-toggle-btn" onClick={() => setShowAdhar(!showAdhar)}>
            🪪 {showAdhar ? "Hide Aadhaar Photos" : "View Aadhaar Photos"}
          </button>
          {showAdhar && (
            <div className="adhar-photos-row">
              {renter.adharFront && (
                <div className="adhar-photo-wrap">
                  <span className="adhar-side-label">Front</span>
                  <img src={renter.adharFront} alt="Aadhaar Front" className="adhar-photo" />
                </div>
              )}
              {renter.adharBack && (
                <div className="adhar-photo-wrap">
                  <span className="adhar-side-label">Back</span>
                  <img src={renter.adharBack} alt="Aadhaar Back" className="adhar-photo" />
                </div>
              )}
            </div>
          )}
        </>
      )}

      <button className="make-agreement-btn" onClick={() => setShowAgreement(true)}>
        📄 Make Agreement
      </button>
    </div>
  );
}

// ── Room Block Component ──
function RentedRoomBlock({ roomData }) {
  const [collapsed, setCollapsed] = useState(false);
  const renters = roomData.renters || [];

  return (
    <div className="rented-room-block">
      <div className="room-block-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="room-block-photo">
          <img src={roomData.roomPhoto || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"} alt="Room" />
        </div>
        <div className="room-block-info">
          <div className="room-block-title" style={{ fontSize: "16px", fontWeight: "700", color: "#0a1628" }}>
            {roomData.roomTitle || "Room Listing"}
          </div>
          <div className="room-block-rent">
            ₹{roomData.rent ? roomData.rent.toLocaleString("en-IN") : "N/A"}{" "}
            <span className="room-block-type">/ {roomData.rentType === "per_month" ? "month" : "person"}</span>
          </div>
          <div className="room-block-location">📍 {roomData.city || "N/A"}</div>
        </div>
        <div className="room-block-right">
          <div className="renter-count-badge">
            👥 {renters.length} Tenant{renters.length !== 1 ? "s" : ""}
          </div>
          <span className="collapse-icon">{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="renters-list">
          {renters.length === 0 ? (
            <div className="no-renters">No accepted renters for this room yet.</div>
          ) : (
            renters.map((renter) => <RenterCard key={renter.id} renter={renter} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Renters Page ──
function Renter({ isLoggedIn = false }) {
  const [rentersList, setRentersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch accepted renters directly from Spring Boot MySQL API
  useEffect(() => {
    const fetchRenters = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log(">>> [Renter.jsx] Sending GET http://localhost:8080/api/renters...");
        const response = await fetch("http://localhost:8080/api/renters", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(">>> [Renter.jsx] RAW API RESPONSE FROM GET /api/renters:", JSON.stringify(data, null, 2));
          console.log(">>> [Renter.jsx] Loaded " + data.length + " renters from MySQL DB");
          setRentersList(data);
        } else {
          console.warn(">>> [Renter.jsx] GET /api/renters failed with status:", response.status);
          setError(`Failed to load renters (${response.status})`);
        }
      } catch (err) {
        console.error("Error fetching renters from MySQL DB:", err);
        setError("Network error loading renters.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchRenters();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="renter-page">
        <div className="renter-wrapper">
          <div className="renter-login-prompt" style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #dce6f0",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
            maxWidth: "500px",
            margin: "40px auto 0"
          }}>
            <div style={{ fontSize: "50px", marginBottom: "20px" }}>🔒</div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0a1628", marginBottom: "10px" }}>Access Restricted</h2>
            <p style={{ fontSize: "14px", color: "#6b7a90", marginBottom: "24px", lineHeight: "1.5" }}>
              Please sign in to view and manage your accepted renters and lease agreements.
            </p>
            <Link to="/login" style={{
              textDecoration: "none",
              display: "inline-block",
              background: "#0a1628",
              color: "#ffffff",
              padding: "12px 30px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#1a5276"}
            onMouseLeave={(e) => e.target.style.background = "#0a1628"}
            >
              🔑 Login to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Group renters by roomId
  const roomMap = {};
  rentersList.forEach((r) => {
    const key = r.roomId || "unspecified";
    if (!roomMap[key]) {
      roomMap[key] = {
        roomId: r.roomId,
        roomTitle: r.roomTitle,
        roomPhoto: r.roomPhoto,
        city: r.city,
        rent: r.rent,
        rentType: r.rentType,
        renters: [],
      };
    }
    roomMap[key].renters.push(r);
  });

  const roomBlocks = Object.values(roomMap);
  const totalRenters = rentersList.length;
  const activeCount = rentersList.filter((r) => (r.status || "Active").toLowerCase() === "active").length;

  return (
    <div className="renter-page">
      <div className="renter-wrapper">
        <div className="renter-page-header">
          <div>
            <h1 className="renter-page-title">👥 Renters</h1>
            <p className="renter-page-sub">Manage accepted tenants across your listed properties</p>
          </div>
          <div className="renter-stats">
            <div className="rstat">
              <span className="rstat-num">{roomBlocks.length}</span>
              <span className="rstat-label">Properties</span>
            </div>
            <div className="rstat-div" />
            <div className="rstat">
              <span className="rstat-num active-col">{activeCount}</span>
              <span className="rstat-label">Active</span>
            </div>
            <div className="rstat-div" />
            <div className="rstat">
              <span className="rstat-num">{totalRenters}</span>
              <span className="rstat-label">Total Tenants</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7a90" }}>
            Loading renters from database…
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#e74c3c" }}>
            ⚠️ {error}
          </div>
        ) : roomBlocks.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #dce6f0"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <h3 style={{ fontSize: "18px", color: "#0a1628", margin: "0 0 8px" }}>No Accepted Renters Yet</h3>
            <p style={{ fontSize: "14px", color: "#6b7a90", margin: 0 }}>
              When you accept rental requests from your Incoming Requests page, your tenants will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="rented-rooms-list">
            {roomBlocks.map((block) => (
              <RentedRoomBlock key={block.roomId} roomData={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Renter;