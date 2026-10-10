import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Favorites.css";

function FavoriteCard({ room, onRemove, onRequest, isRequested, tenantProfile, currentUserId }) {
  const [showMore, setShowMore] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [flash, setFlash] = useState(null); // "sent" | "incomplete"
  const navigate = useNavigate();

  const isOwner = currentUserId != null && room.ownerId != null && Number(currentUserId) === Number(room.ownerId);

  const photos = (room.photos || []).map((p) => (typeof p === "string" ? p : p.url || ""));

  const handleRequestClick = async () => {
    if (isOwner) return;

    const name    = tenantProfile?.fullName?.trim();
    const contact = tenantProfile?.phone?.trim();

    if (!name || !contact) {
      // Profile not filled — flash warning and redirect
      setFlash("incomplete");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const payload = {
      roomId:       room.id,
      name,
      contact,
      adharNumber:  tenantProfile?.adharNumber || "",
      adharFront:   tenantProfile?.adharFront || null,
      adharBack:    tenantProfile?.adharBack || null,
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
        setTimeout(() => setFlash(null), 2500);
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Request failed with status ${response.status}`;
        alert(msg);
      }
    } catch (err) {
      console.error("Failed to submit rental request from favorites:", err);
      alert("Failed to send request. Please check your connection.");
    }
  };

  return (
    <div className="fav-card">

      {/* Photo Slider */}
      <div className="fav-photo-wrap">
        <img
          src={photos[activePhoto]}
          alt={`Room ${activePhoto + 1}`}
          className="fav-photo"
        />

        {/* Remove from favorites */}
        <button className="fav-remove-btn" onClick={() => onRemove(room.id)} title="Remove from favorites">
          ❤️
        </button>

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="fav-photo-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`fav-dot ${i === activePhoto ? "active" : ""}`}
                onClick={() => setActivePhoto(i)}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="fav-photo-count">📷 {activePhoto + 1} / {photos.length}</div>
      </div>

      {/* Card Body */}
      <div className="fav-card-body">

        {/* Rent */}
        <div className="fav-rent-row">
          <div className="fav-rent">
            ₹{room.rent.toLocaleString("en-IN")}
            <span className="fav-rent-type">/ {room.rentType === "per_month" ? "month" : "person"}</span>
          </div>
          <span className="fav-saved-tag">❤️ Saved</span>
        </div>

        {/* Notes */}
        {room.notes && (
          <p className="fav-notes">
            {room.notes.length > 110 ? room.notes.slice(0, 110) + "..." : room.notes}
          </p>
        )}

        <div className="fav-date">📅 Posted {room.postedAt}</div>

        {/* More details → navigate to Room Detail page */}
        <button
          className="fav-more-btn"
          onClick={() => navigate(`/rooms/${room.id}`)}
        >
          More →
        </button>

        {/* Flash messages */}
        {flash === "sent" && (
          <div className="fav-flash fav-flash-success">✅ Request sent successfully!</div>
        )}
        {flash === "incomplete" && (
          <div className="fav-flash fav-flash-warn">⚠️ Please complete your profile first. Redirecting...</div>
        )}

        {/* Request to Rent button */}
        {isOwner ? (
          <div className="fav-own-listing-msg">
            🚫 This is your own listing.
          </div>
        ) : (
          <button
            className={`fav-request-btn ${isRequested ? "fav-requested" : ""}`}
            onClick={handleRequestClick}
            disabled={isRequested}
          >
            {isRequested ? "✅ Request Sent" : "📨 Request to Rent"}
          </button>
        )}

      </div>
    </div>
  );
}

function Favorites({ favorites = [], onRemove, onRequest, requestedIds = [], tenantProfile, currentUserId }) {
  return (
    <div className="favorites-page">
      <div className="favorites-wrapper">

        {/* Header */}
        <div className="fav-page-header">
          <div>
            <h1 className="fav-page-title">❤️ My Favorites</h1>
            <p className="fav-page-sub">Rooms you have saved for later</p>
          </div>
          {favorites.length > 0 && (
            <div className="fav-count-badge">{favorites.length} saved</div>
          )}
        </div>

        {/* Empty state */}
        {favorites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">🤍</div>
            <h2>No favorites yet</h2>
            <p>Browse rooms and click <strong>❤️ Add to Favorites</strong> to save them here.</p>
            <Link to="/" className="fav-browse-btn">🏠 Browse Rooms</Link>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map((room) => (
              <FavoriteCard
                key={room.id}
                room={room}
                onRemove={onRemove}
                onRequest={onRequest}
                isRequested={requestedIds.includes(room.id)}
                tenantProfile={tenantProfile}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Favorites;