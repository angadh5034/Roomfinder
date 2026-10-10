import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/RoomDetail.css";

// ── Utility ──────────────────────────────────────────────────────────────────
function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}
function computeStatus(room) {
  if (room.manualStatus) return room.manualStatus;
  return daysSince(room.postedAt) >= 28 ? "inactive" : "active";
}

// ── Photo Gallery ─────────────────────────────────────────────────────────────
function Gallery({ photos = [] }) {
  const [active, setActive] = useState(0);
  const safePhotos = photos.length > 0 ? photos : [null];

  const prev = () => setActive((i) => (i - 1 + safePhotos.length) % safePhotos.length);
  const next = () => setActive((i) => (i + 1) % safePhotos.length);

  return (
    <div className="rd-gallery">
      <div className="rd-gallery-main">
        {safePhotos[active] ? (
          <img src={safePhotos[active]} alt={`Photo ${active + 1}`} className="rd-gallery-img" />
        ) : (
          <div className="rd-gallery-placeholder">🏠 No Photos</div>
        )}
        {safePhotos.length > 1 && (
          <>
            <button className="rd-gallery-nav rd-gallery-prev" onClick={prev}>‹</button>
            <button className="rd-gallery-nav rd-gallery-next" onClick={next}>›</button>
            <div className="rd-gallery-counter">{active + 1} / {safePhotos.length}</div>
          </>
        )}
      </div>
      {safePhotos.length > 1 && (
        <div className="rd-gallery-thumbs">
          {safePhotos.map((photo, i) => (
            <button
              key={i}
              className={`rd-thumb-btn ${i === active ? "rd-thumb-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <img src={photo} alt={`Thumb ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail Row ────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }) {
  if (value == null || value === "" || value === false) return null;
  return (
    <div className="rd-detail-row">
      <span className="rd-detail-icon">{icon}</span>
      <div className="rd-detail-content">
        <span className="rd-detail-label">{label}</span>
        <span className="rd-detail-value">{value}</span>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="rd-section">
      <h2 className="rd-section-title">{icon} {title}</h2>
      <div className="rd-section-body">{children}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function RoomDetail({ rooms = [], requests = [], onRequest, isLoggedIn, tenantProfile, currentUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash]     = useState(null); // "sent" | "incomplete" | "login"
  const [requested, setRequested] = useState(false);

  // ── Load room: first from props (instant), then from API (authoritative) ──
  useEffect(() => {
    const fromProps = rooms.find((r) => String(r.id) === String(id));
    if (fromProps) {
      setRoom(fromProps);
      setLoading(false);
    }

    // Always fetch from API to get fresh data
    fetch(`http://localhost:8080/api/rooms/${id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setRoom(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ── Check if already requested ──
  useEffect(() => {
    setRequested(requests.some((r) => String(r.roomId) === String(id)));
  }, [requests, id]);

  // ── Request to Rent ──
  const handleRequestClick = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const isOwnerCheck = currentUserId != null && room?.ownerId != null && Number(currentUserId) === Number(room.ownerId);
    if (isOwnerCheck) {
      setFlash("owner");
      return;
    }

    const name    = tenantProfile?.fullName?.trim();
    const contact = tenantProfile?.phone?.trim();
    if (!name || !contact) {
      setFlash("incomplete");
      setTimeout(() => { setFlash(null); navigate("/profile"); }, 2000);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      roomId:       room.id,
      name,
      contact,
      adharNumber:  tenantProfile?.adharNumber || "",
      adharFront:   tenantProfile?.adharFront  || null,
      adharBack:    tenantProfile?.adharBack   || null,
      message:      "",
    };

    try {
      const response = await fetch(`http://localhost:8080/api/requests/${room.id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 201 || response.status === 200 || response.ok) {
        const savedReq = await response.json();
        onRequest && onRequest(savedReq);
        setFlash("sent");
        setRequested(true);
        setTimeout(() => setFlash(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Request failed with status ${response.status}`;
        alert(msg);
        if (response.status === 403) {
          setFlash("owner");
        }
      }
    } catch (err) {
      console.error("Failed to submit rental request:", err);
      alert("Failed to send request. Please check your connection.");
    }
  };

  // ── States ──
  if (loading) return <div className="rd-loading">Loading room details…</div>;
  if (!room)   return (
    <div className="rd-not-found">
      <div className="rd-not-found-icon">🏠</div>
      <h2>Room not found</h2>
      <p>This listing may have been removed or is unavailable.</p>
      <button className="rd-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  const status = computeStatus(room);
  const photos = (room.photos || []).map((p) => typeof p === "string" ? p : p?.url || "");

  // Privacy: check if user has an accepted request for this room
  const acceptedRequest = requests.find(
    (r) => String(r.roomId) === String(id) && r.status === "accepted"
  );
  const showPrivateInfo = !!acceptedRequest;

  const boolLabel  = (v) => v === true || v === "true" ? "Yes" : v === false || v === "false" ? "No" : v;
  const amenityList = (room.amenities || []).join(", ") || null;

  // Owner guard: logged-in user is the landlord of this room
  const isOwner = currentUserId != null && room.ownerId != null && Number(currentUserId) === Number(room.ownerId);

  return (
    <div className="rd-page">
      <div className="rd-container">

        {/* ── Back Button ── */}
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* ── Status Badge ── */}
        <div className={`rd-status-badge ${status}`}>
          {status === "active" ? "● Active" : "● Inactive"}
        </div>

        {/* ── Title ── */}
        <h1 className="rd-title">{room.title || "Room Listing"}</h1>

        {/* ── Location summary ── */}
        <div className="rd-location-summary">
          📍 {room.locality ? `${room.locality}, ` : ""}{room.city}
        </div>

        {/* ── Gallery ── */}
        <Gallery photos={photos} />

        {/* ── Rent Banner ── */}
        <div className="rd-rent-banner">
          <div className="rd-rent-main">
            <span className="rd-rent-amount">₹{(room.rent || 0).toLocaleString("en-IN")}</span>
            <span className="rd-rent-slash">/</span>
            <span className="rd-rent-type">{room.rentType === "per_month" ? "month" : "person"}</span>
          </div>
          <div className="rd-rent-meta">
            {room.deposit > 0 && <span>Deposit ₹{room.deposit.toLocaleString("en-IN")}</span>}
            {room.negotiable === "Yes" && <span className="rd-negotiable-tag">Negotiable</span>}
          </div>
        </div>

        {/* ── Description ── */}
        {room.description && (
          <Section title="About this Room" icon="📝">
            <p className="rd-description">{room.description}</p>
          </Section>
        )}

        {/* ── Overview ── */}
        <Section title="Overview" icon="🏠">
          <div className="rd-details-grid">
            <DetailRow icon="🏘️" label="Listing Type"    value={room.listingType?.replace("_", " ")} />
            <DetailRow icon="🏢" label="Property Type"   value={room.propertyType} />
            <DetailRow icon="📅" label="Available From"  value={room.availableFrom} />
            <DetailRow icon="🛋️" label="Furnishing"      value={room.furnishing} />
            <DetailRow icon="🏗️" label="Property Age"    value={room.propertyAge} />
          </div>
        </Section>

        {/* ── Room Details ── */}
        <Section title="Room Details" icon="🛏️">
          <div className="rd-details-grid">
            <DetailRow icon="🛏️" label="Bedrooms"           value={room.bedrooms} />
            <DetailRow icon="🚿" label="Bathrooms"           value={room.bathrooms} />
            <DetailRow icon="👥" label="Occupancy"           value={`${room.occupancy} person(s)`} />
            <DetailRow icon="🏗️" label="Floor"              value={room.floor != null ? `${room.floor} / ${room.totalFloors}` : null} />
            <DetailRow icon="🌿" label="Balcony"             value={boolLabel(room.hasBalcony)} />
            <DetailRow icon="🚪" label="Attached Bathroom"   value={boolLabel(room.hasAttachedBathroom)} />
            <DetailRow icon="🚗" label="Parking"             value={room.parking} />
          </div>
        </Section>

        {/* ── Pricing ── */}
        <Section title="Pricing & Charges" icon="💰">
          <div className="rd-details-grid">
            <DetailRow icon="💵" label="Monthly Rent"        value={`₹${(room.rent || 0).toLocaleString("en-IN")}`} />
            <DetailRow icon="🔐" label="Security Deposit"    value={room.deposit > 0 ? `₹${room.deposit.toLocaleString("en-IN")}` : "None"} />
            <DetailRow icon="🔧" label="Maintenance"         value={room.maintenance} />
            {room.maintenance === "Separate" && room.maintenanceAmount > 0 && (
              <DetailRow icon="💳" label="Maintenance Amount" value={`₹${room.maintenanceAmount.toLocaleString("en-IN")}`} />
            )}
            <DetailRow icon="⚡" label="Electricity"         value={room.electricity} />
            <DetailRow icon="💧" label="Water"               value={room.water} />
            <DetailRow icon="🤝" label="Negotiable"          value={room.negotiable} />
          </div>
        </Section>

        {/* ── Amenities ── */}
        {amenityList && (
          <Section title="Amenities" icon="✨">
            <div className="rd-amenities-wrap">
              {(room.amenities || []).map((a, i) => (
                <span key={i} className="rd-amenity-tag">{a}</span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Rules & Preferences ── */}
        <Section title="Rules & Preferences" icon="📋">
          <div className="rd-details-grid">
            <DetailRow icon="👤" label="Preferred Tenant"  value={room.preferredTenant} />
            <DetailRow icon="🍽️" label="Food Preference"  value={room.foodPreference} />
            <DetailRow icon="🚬" label="Smoking"           value={boolLabel(room.smokingAllowed)} />
            <DetailRow icon="🐾" label="Pets"              value={boolLabel(room.petsAllowed)} />
            <DetailRow icon="🚪" label="Visitors"          value={room.visitorRules} />
          </div>
          {room.additionalRules && (
            <div className="rd-additional-rules">
              <span className="rd-detail-label">Additional Rules</span>
              <p className="rd-rules-text">{room.additionalRules}</p>
            </div>
          )}
        </Section>

        {/* ── Location (public: city + locality only) ── */}
        <Section title="Location" icon="📍">
          <div className="rd-details-grid">
            <DetailRow icon="🏙️" label="City"     value={room.city} />
            <DetailRow icon="📌" label="Locality"  value={room.locality} />
            <DetailRow icon="📮" label="Pincode"   value={room.pincode} />
          </div>

          {/* ── Private info: shown ONLY after request accepted ── */}
          {showPrivateInfo ? (
            <div className="rd-private-revealed">
              <div className="rd-private-revealed-title">✅ Full details unlocked</div>
              <div className="rd-details-grid">
                <DetailRow icon="🏠" label="Street Address" value={room.uploadedBy?.streetAddress || room.streetAddress} />
                <DetailRow icon="🗺️" label="Landmark"       value={room.landmark} />
                <DetailRow icon="👤" label="Owner Name"     value={room.uploadedBy?.name} />
                <DetailRow icon="📞" label="Phone"          value={room.uploadedBy?.contact} />
                <DetailRow icon="✉️" label="Email"          value={room.uploadedBy?.email} />
              </div>
            </div>
          ) : (
            <div className="rd-privacy-notice">
              <div className="rd-privacy-icon">🔒</div>
              <div className="rd-privacy-text">
                <strong>Owner contact and exact address are private.</strong>
                <p>Exact property location and owner contact details will be shared after the owner accepts your rental request.</p>
              </div>
            </div>
          )}
        </Section>

        {/* ── Flash messages ── */}
        {flash === "sent" && (
          <div className="rd-flash rd-flash-success">✅ Request sent! The owner will review it shortly.</div>
        )}
        {flash === "incomplete" && (
          <div className="rd-flash rd-flash-warn">⚠️ Please complete your profile first. Redirecting…</div>
        )}
        {flash === "owner" && (
          <div className="rd-flash rd-flash-warn">⚠️ You cannot send a rental request for your own listing.</div>
        )}

        {/* ── Request to Rent CTA ── */}
        <div className="rd-cta-bar">
          <div className="rd-cta-rent">
            <span className="rd-cta-amount">₹{(room.rent || 0).toLocaleString("en-IN")}</span>
            <span className="rd-cta-type">/ {room.rentType === "per_month" ? "month" : "person"}</span>
          </div>

          {isOwner ? (
            <div className="rd-own-listing-msg">
              🚫 This is your own listing.
            </div>
          ) : (
            <button
              className={`rd-request-btn ${requested ? "rd-requested" : ""} ${status === "inactive" ? "rd-inactive-btn" : ""}`}
              onClick={handleRequestClick}
              disabled={requested || status === "inactive"}
            >
              {status === "inactive"
                ? "🚫 Not Available"
                : requested
                ? "✅ Request Sent"
                : "📨 Request to Rent"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default RoomDetail;
