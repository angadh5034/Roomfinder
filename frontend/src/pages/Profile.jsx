import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Profile.css";

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function computeStatus(room) {
  if (room.manualStatus) return room.manualStatus;
  return daysSince(room.postedAt) >= 28 ? "inactive" : "active";
}

const demoMyRooms = [];

// ── My Rooms list ──
function MyRooms({ rooms, onDeleteRoom, onAddRoomClick }) {
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = (id) => {
    onDeleteRoom && onDeleteRoom(id);
    setDeleteId(null);
  };

  if (rooms.length === 0) {
    return (
      <div className="no-rooms-box">
        <div className="no-rooms-icon">🏠</div>
        <h3>No rooms listed yet</h3>
        <p>You haven't added any rooms. Click "Add Room" to list your first room.</p>
        <Link to="/addroom" className="add-first-btn" onClick={onAddRoomClick}>➕ Add Your First Room</Link>
      </div>
    );
  }

  return (
    <div className="my-rooms-list">
      {rooms.map((room) => {
        const status   = computeStatus(room);
        const days     = daysSince(room.postedAt);
        const autoExp  = days >= 28 && !room.manualStatus;
        const daysLeft = Math.max(0, 28 - days);

        return (
          <div key={room.id} className={`my-room-card ${status === "inactive" ? "card-inactive" : ""}`}>
            <div className="mrc-photo">
              <img src={room.photos?.[0] || ""} alt="Room" />
              <span className={`status-badge ${status}`}>
                {status === "active" ? "● Active" : "● Inactive"}
              </span>
            </div>
            <div className="mrc-details">
              <div className="mrc-rent">
                ₹{(room.rent ?? 0).toLocaleString("en-IN")}
                <span className="mrc-type">/ {room.rentType === "per_month" ? "month" : "person"}</span>
              </div>
              <div className="mrc-location">📍 {room.location}</div>
              <div className="mrc-notes">{room.description ? (room.description.length > 80 ? room.description.slice(0, 80) + "..." : room.description) : ""}</div>
              {status === "active" && !autoExp && !room.manualStatus && (
                <div className="expiry-info active-info">⏳ Auto-expires in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong></div>
              )}
              {status === "inactive" && autoExp && (
                <div className="expiry-info inactive-info">⏰ Auto-expired — click Edit to reactivate</div>
              )}
              {status === "inactive" && !autoExp && (
                <div className="expiry-info manual-info">🔒 Manually set to inactive</div>
              )}
              {status === "active" && room.manualStatus === "active" && (
                <div className="expiry-info manual-info">✅ Manually reactivated</div>
              )}
            </div>
            <div className="mrc-actions">
              <Link to="/renters" className="mrc-renters-btn">👥 Renters</Link>
              <Link to="/editroom" className="mrc-edit-btn">✏️ Edit</Link>
              {deleteId === room.id ? (
                <div className="confirm-delete">
                  <span>Delete?</span>
                  <button className="confirm-yes" onClick={() => handleDelete(room.id)}>Yes</button>
                  <button className="confirm-no" onClick={() => setDeleteId(null)}>No</button>
                </div>
              ) : (
                <button className="mrc-delete-btn" onClick={() => setDeleteId(room.id)}>🗑️ Delete</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Profile ──
function Profile({ rooms = [], requests = [], onRequestStatusChange, tenantProfile, onProfileSave, onDeleteRoom, isLoggedIn }) {
  const allMyRooms = [...demoMyRooms, ...rooms];
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "profile";
  });
  
  React.useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [errors, setErrors]       = useState({});
  const navigate                  = useNavigate();

  const handleAddRoomClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/addroom");
    }
  };

  // Use lifted profile state from App; fallback for safety
  const profile = tenantProfile || {
    username: "", fullName: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "", location: "",
    adharNumber: "", adharFront: null, adharBack: null,
  };
  const setProfile = (updater) => {
    const next = typeof updater === "function" ? updater(profile) : updater;
    onProfileSave && onProfileSave(next);
  };

  // saved snapshot for cancel
  const [savedProfile, setSavedProfile] = useState({ ...profile });

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const dbProfile = await response.json();
          setProfile(dbProfile);
          setSavedProfile(dbProfile);
        }
      } catch (err) {
        console.warn("Failed to fetch profile from API, using local fallback", err);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const validate = () => {
    const e = {};
    if (!profile.username.trim()) e.username = "Username is required";
    if (!profile.fullName.trim()) e.fullName = "Full name is required";
    if (!profile.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) e.email = "Invalid email";
    if (!profile.phone.trim())    e.phone    = "Contact number is required";
    else if (!/^\d{10}$/.test(profile.phone)) e.phone = "Enter valid 10-digit number";
    if (!profile.adharNumber.trim()) e.adharNumber = "Aadhar number is required";
    else if (profile.adharNumber.replace(/\s/g, "").length !== 12) e.adharNumber = "Enter valid 12-digit Aadhar number";
    if (!profile.adharFront) e.adharFront = "Aadhar front photo is required";
    if (!profile.adharBack)  e.adharBack  = "Aadhar back photo is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAdharPhoto = (side, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, [side === "front" ? "adharFront" : "adharBack"]: reader.result }));
      setErrors((p) => ({ ...p, [side === "front" ? "adharFront" : "adharBack"]: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit   = () => { setSavedProfile({ ...profile }); setIsEditing(true); setSaved(false); };
  const handleCancel = () => { setProfile({ ...savedProfile }); setIsEditing(false); setErrors({}); };
  const handleSave   = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await fetch("http://localhost:8080/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(profile)
        });

        if (response.ok) {
          const updated = await response.json();
          setProfile(updated);
          setSavedProfile(updated);
          setIsEditing(false);
          setSaved(true);
          return;
        } else {
          console.warn("Failed to update profile on server, using local fallback");
        }
      } catch (err) {
        console.warn("Failed to reach profile API, using local fallback", err);
      }
    }

    setSavedProfile({ ...profile });
    setIsEditing(false);
    setSaved(true);
  };

  const initials = profile.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const activeCount   = allMyRooms.filter((r) => computeStatus(r) === "active").length;
  const inactiveCount = allMyRooms.filter((r) => computeStatus(r) === "inactive").length;

  return (
    <div className="profile-page">
      <div className="profile-wrapper">

        {/* ── SIDEBAR ── */}
        <div className="profile-sidebar">
          <div className="avatar-large"><span>{initials}</span></div>
          <h2 className="sidebar-name">{profile.fullName || "Your Name"}</h2>
          <p className="sidebar-username">@{profile.username || "username"}</p>
          <p className="sidebar-email">{profile.email || "email@example.com"}</p>

          <div className="sidebar-divider" />

          {/* Nav tabs */}
          <button className={`sidebar-nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}>👤 My Profile</button>

          <button className={`sidebar-nav-btn ${activeTab === "myrooms" ? "active" : ""}`}
            onClick={() => setActiveTab("myrooms")}>
            🏠 My Rooms <span className="rooms-count-badge">{allMyRooms.length}</span>
          </button>

          <button className={`sidebar-nav-btn ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => navigate("/incoming-requests")}>
            📥 Incoming Requests
          </button>

          <button className={`sidebar-nav-btn ${activeTab === "myrequests" ? "active" : ""}`}
            onClick={() => navigate("/my-requests")}>
            📨 My Requests
          </button>

          {activeTab === "myrooms" && (
            <div className="room-stats">
              <div className="stat-item"><span className="stat-num active-num">{activeCount}</span><span className="stat-label">Active</span></div>
              <div className="stat-divider" />
              <div className="stat-item"><span className="stat-num inactive-num">{inactiveCount}</span><span className="stat-label">Inactive</span></div>
            </div>
          )}

          <div className="sidebar-divider" />

          {/* Edit / Save / Cancel in sidebar — only on profile tab */}
          {activeTab === "profile" && (
            <>
              {!isEditing ? (
                <button className="sidebar-edit-btn" onClick={handleEdit}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="sidebar-edit-actions">
                  <button className="sidebar-save-btn" onClick={handleSave}>💾 Save Profile</button>
                  <button className="sidebar-cancel-btn" onClick={handleCancel}>✕ Cancel</button>
                </div>
              )}
              <div className="sidebar-divider" />
            </>
          )}

          <Link to="/addroom" className="add-room-btn" onClick={handleAddRoomClick}>
            <span className="btn-icon">➕</span> Add Room
          </Link>
          <p className="sidebar-hint">List your room for rent</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="profile-form-panel">

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <>
              {/* Header with Edit / Save / Cancel */}
              <div className="form-header">
                <div className="form-header-row">
                  <div>
                    <h1 className="form-title">My Profile</h1>
                    <p className="form-subtitle">
                      {isEditing
                        ? "Edit mode — update your details and save"
                        : "Your personal details"}
                    </p>
                  </div>

                  <div className="form-header-actions">
                    {!isEditing ? (
                      <button className="profile-edit-btn" onClick={handleEdit}>
                        ✏️ Edit Profile
                      </button>
                    ) : (
                      <>
                        <button className="profile-save-btn" onClick={handleSave}>
                          💾 Save
                        </button>
                        <button className="profile-cancel-btn" onClick={handleCancel}>
                          ✕ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="editing-banner">✏️ You are in edit mode — make your changes and click Save</div>
                )}
              </div>

              {saved && <div className="success-alert">✅ Profile saved successfully!</div>}

              {/* Account */}
              <div className="form-section">
                <h3 className="section-title">Account Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input type="text" name="username" value={profile.username} onChange={handleChange}
                      placeholder="e.g. angadh5034" disabled={!isEditing}
                      className={`${errors.username ? "input-error" : ""} ${!isEditing ? "input-disabled" : ""}`} />
                    {errors.username && <span className="error-msg">{errors.username}</span>}
                  </div>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="fullName" value={profile.fullName} onChange={handleChange}
                      placeholder="e.g. Angadh Dhole" disabled={!isEditing}
                      className={`${errors.fullName ? "input-error" : ""} ${!isEditing ? "input-disabled" : ""}`} />
                    {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="form-section">
                <h3 className="section-title">Contact Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" value={profile.email} onChange={handleChange}
                      placeholder="e.g. angadh@email.com" disabled={!isEditing}
                      className={`${errors.email ? "input-error" : ""} ${!isEditing ? "input-disabled" : ""}`} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange}
                      placeholder="10-digit mobile number" maxLength={10} disabled={!isEditing}
                      className={`${errors.phone ? "input-error" : ""} ${!isEditing ? "input-disabled" : ""}`} />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-section">
                <h3 className="section-title">Address</h3>
                <div className="form-group full-width">
                  <label>Street Address</label>
                  <input type="text" name="address" value={profile.address} onChange={handleChange}
                    placeholder="e.g. 45, Shivaji Nagar, Near Bus Stand" disabled={!isEditing}
                    className={!isEditing ? "input-disabled" : ""} />
                </div>
                <div className="form-row three-col">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" value={profile.city} onChange={handleChange}
                      placeholder="Nagpur" disabled={!isEditing}
                      className={!isEditing ? "input-disabled" : ""} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" name="state" value={profile.state} onChange={handleChange}
                      placeholder="Maharashtra" disabled={!isEditing}
                      className={!isEditing ? "input-disabled" : ""} />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input type="text" name="pincode" value={profile.pincode} onChange={handleChange}
                      placeholder="440001" maxLength={6} disabled={!isEditing}
                      className={!isEditing ? "input-disabled" : ""} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <h3 className="section-title">Location Description</h3>
                <div className="form-group full-width">
                  <label>Describe your location</label>
                  <textarea name="location" value={profile.location} onChange={handleChange} rows={3}
                    placeholder="e.g. Near Nagpur Railway Station, 5 mins walk from Sitabuldi market..."
                    disabled={!isEditing}
                    className={!isEditing ? "input-disabled" : ""} />
                  <span className="field-hint">Write landmarks or directions to help others find you.</span>
                </div>
              </div>

              {/* ── AADHAR SECTION ── */}
              <div className="form-section">
                <h3 className="section-title">Aadhar Details</h3>

                <div className="form-group full-width" style={{ marginBottom: "16px" }}>
                  <label>Aadhar Number *</label>
                  <input type="text" name="adharNumber" value={profile.adharNumber} onChange={handleChange}
                    placeholder="XXXX XXXX XXXX" maxLength={14} disabled={!isEditing}
                    className={`adhar-number-input ${errors.adharNumber ? "input-error" : ""} ${!isEditing ? "input-disabled" : ""}`} />
                  {errors.adharNumber && <span className="error-msg">{errors.adharNumber}</span>}
                </div>

                <div className="adhar-upload-row">
                  {/* Front */}
                  <div className="form-group">
                    <label>Aadhar Front Photo *</label>
                    <label
                      htmlFor="adhar-front-profile"
                      className={`adhar-upload-box ${profile.adharFront ? "adhar-uploaded" : ""} ${errors.adharFront ? "adhar-upload-error" : ""} ${!isEditing ? "adhar-disabled" : ""}`}
                    >
                      {profile.adharFront ? (
                        <img src={profile.adharFront} alt="Aadhar Front" className="adhar-img-preview" />
                      ) : (
                        <>
                          <span className="adhar-upload-icon">📄</span>
                          <p className="adhar-upload-text">
                            {isEditing ? "Click to upload front" : "Not uploaded"}
                          </p>
                        </>
                      )}
                      {isEditing && (
                        <input id="adhar-front-profile" type="file" accept="image/*"
                          onChange={(e) => handleAdharPhoto("front", e)}
                          style={{ display: "none" }} />
                      )}
                    </label>
                    {errors.adharFront && <span className="error-msg">{errors.adharFront}</span>}
                    {profile.adharFront && isEditing && (
                      <button className="adhar-remove-btn"
                        onClick={() => setProfile((p) => ({ ...p, adharFront: null }))}>
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  {/* Back */}
                  <div className="form-group">
                    <label>Aadhar Back Photo *</label>
                    <label
                      htmlFor="adhar-back-profile"
                      className={`adhar-upload-box ${profile.adharBack ? "adhar-uploaded" : ""} ${errors.adharBack ? "adhar-upload-error" : ""} ${!isEditing ? "adhar-disabled" : ""}`}
                    >
                      {profile.adharBack ? (
                        <img src={profile.adharBack} alt="Aadhar Back" className="adhar-img-preview" />
                      ) : (
                        <>
                          <span className="adhar-upload-icon">📄</span>
                          <p className="adhar-upload-text">
                            {isEditing ? "Click to upload back" : "Not uploaded"}
                          </p>
                        </>
                      )}
                      {isEditing && (
                        <input id="adhar-back-profile" type="file" accept="image/*"
                          onChange={(e) => handleAdharPhoto("back", e)}
                          style={{ display: "none" }} />
                      )}
                    </label>
                    {errors.adharBack && <span className="error-msg">{errors.adharBack}</span>}
                    {profile.adharBack && isEditing && (
                      <button className="adhar-remove-btn"
                        onClick={() => setProfile((p) => ({ ...p, adharBack: null }))}>
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MY ROOMS TAB ── */}
          {activeTab === "myrooms" && (
            <>
              <div className="form-header">
                <div className="myrooms-header-row">
                  <div>
                    <h1 className="form-title">My Rooms</h1>
                    <p className="form-subtitle">{allMyRooms.length} room{allMyRooms.length !== 1 ? "s" : ""} listed by you</p>
                  </div>
                  <Link to="/addroom" className="add-room-top-btn" onClick={handleAddRoomClick}>➕ Add New Room</Link>
                </div>
              </div>
              <MyRooms rooms={allMyRooms} onDeleteRoom={onDeleteRoom} onAddRoomClick={handleAddRoomClick} />
            </>
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === "requests" && (
            <>
              <div className="form-header">
                <h1 className="form-title">📨 Requests</h1>
                <p className="form-subtitle">
                  {requests.length === 0
                    ? "No rent requests yet"
                    : `${requests.length} request${requests.length !== 1 ? "s" : ""} — ${requests.filter(r => r.status === "pending").length} pending`}
                </p>
              </div>

              {requests.length === 0 ? (
                <div className="no-rooms-box">
                  <div className="no-rooms-icon">📭</div>
                  <h3>No requests yet</h3>
                  <p>When visitors click "Request to Rent" on your room, their requests will appear here.</p>
                </div>
              ) : (
                <div className="requests-list">
                  {requests.map((req) => (
                    <div key={req.id} className={`req-card req-status-${req.status}`}>

                      {/* Room preview + requester info */}
                      <div className="req-card-top">
                        {req.roomPhoto && (
                          <img src={req.roomPhoto} alt="Room" className="req-card-photo" />
                        )}
                        <div className="req-card-info">
                          <div className="req-card-rent">
                            ₹{req.roomRent?.toLocaleString("en-IN")}
                            <span className="req-card-type">/ {req.roomRentType === "per_month" ? "month" : "person"}</span>
                          </div>
                          {req.roomCity && <div className="req-card-city">📍 {req.roomCity}</div>}
                        </div>
                        <span className={`req-status-badge req-badge-${req.status}`}>
                          {req.status === "pending"  && "⏳ Pending"}
                          {req.status === "accepted" && "✅ Accepted"}
                          {req.status === "rejected" && "❌ Rejected"}
                        </span>
                      </div>

                      {/* Requester details */}
                      <div className="req-card-body">
                        <div className="req-detail-row">
                          <span className="req-detail-icon">👤</span>
                          <div>
                            <span className="req-detail-label">Requester</span>
                            <span className="req-detail-value">{req.name}</span>
                          </div>
                        </div>
                        <div className="req-detail-row">
                          <span className="req-detail-icon">📞</span>
                          <div>
                            <span className="req-detail-label">Contact</span>
                            <a href={`tel:${req.contact}`} className="req-detail-contact">{req.contact}</a>
                          </div>
                        </div>
                        {req.message && (
                          <div className="req-detail-row">
                            <span className="req-detail-icon">💬</span>
                            <div>
                              <span className="req-detail-label">Message</span>
                              <span className="req-detail-value">{req.message}</span>
                            </div>
                          </div>
                        )}
                        <div className="req-detail-row">
                          <span className="req-detail-icon">📅</span>
                          <div>
                            <span className="req-detail-label">Requested on</span>
                            <span className="req-detail-value">{req.requestedAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons — only for pending */}
                      {req.status === "pending" && (
                        <div className="req-card-actions">
                          <button
                            className="req-accept-btn"
                            onClick={() => onRequestStatusChange(req.id, "accepted")}
                          >
                            ✅ Accept
                          </button>
                          <button
                            className="req-reject-btn"
                            onClick={() => onRequestStatusChange(req.id, "rejected")}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;