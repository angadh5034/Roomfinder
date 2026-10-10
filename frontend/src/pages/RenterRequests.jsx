import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/RenterRequests.css";

function RenterRequests({ requests = [], currentUserId, rooms = [], tenantProfile }) {
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "accepted" | "rejected"

  // Filter requests submitted by the logged-in renter
  const myRequests = requests.filter((r) => {
    if (r.requesterId != null && currentUserId != null) {
      return Number(r.requesterId) === Number(currentUserId);
    }
    // Fallback: match by contact or name if requesterId not present
    if (tenantProfile?.phone) {
      return r.contact === tenantProfile.phone;
    }
    return true;
  });

  const pendingCount  = myRequests.filter((r) => r.status === "pending").length;
  const acceptedCount = myRequests.filter((r) => r.status === "accepted").length;
  const rejectedCount = myRequests.filter((r) => r.status === "rejected").length;

  const filteredRequests = myRequests.filter((r) => {
    if (filter === "pending")  return r.status === "pending";
    if (filter === "accepted") return r.status === "accepted";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  return (
    <div className="renter-req-page">
      <div className="renter-req-container">

        {/* ── Page Header ── */}
        <div className="renter-req-header">
          <div>
            <h1 className="renter-req-title">📨 My Rental Requests</h1>
            <p className="renter-req-sub">
              Track the status of rental requests you've submitted to room owners.
            </p>
          </div>
          {acceptedCount > 0 && (
            <div className="renter-req-alert-badge">
              🎉 {acceptedCount} Request{acceptedCount !== 1 ? "s" : ""} Accepted!
            </div>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div className="renter-req-stats">
          <div className="stat-card stat-total">
            <span className="stat-num">{myRequests.length}</span>
            <span className="stat-label">Total Sent</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-num">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card stat-accepted">
            <span className="stat-num">{acceptedCount}</span>
            <span className="stat-label">Accepted</span>
          </div>
          <div className="stat-card stat-rejected">
            <span className="stat-num">{rejectedCount}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="renter-req-tabs">
          <button
            className={`tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({myRequests.length})
          </button>
          <button
            className={`tab-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`tab-btn ${filter === "accepted" ? "active" : ""}`}
            onClick={() => setFilter("accepted")}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            className={`tab-btn ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* ── Requests List / Empty State ── */}
        {filteredRequests.length === 0 ? (
          <div className="renter-req-empty">
            <div className="empty-icon">📨</div>
            <h2>No requests found</h2>
            <p>
              {filter === "all"
                ? "You haven't sent any rental requests yet. Browse available rooms to get started!"
                : `No requests with '${filter}' status.`}
            </p>
            <Link to="/" className="browse-rooms-btn">
              🏠 Browse Available Rooms
            </Link>
          </div>
        ) : (
          <div className="renter-req-list">
            {filteredRequests.map((req) => {
              // Lookup room from rooms list to retrieve fresh data if needed
              const room = rooms.find((r) => String(r.id) === String(req.roomId));
              const isAccepted = req.status === "accepted";
              const isRejected = req.status === "rejected";
              const isPending  = req.status === "pending";

              // Resolved owner & location details
              const ownerName     = req.ownerName || room?.uploadedBy?.name || "Private";
              const ownerContact  = req.ownerContact || room?.uploadedBy?.contact || "Private";
              const ownerEmail    = req.ownerEmail || room?.uploadedBy?.email || "Private";
              const streetAddress = req.streetAddress || room?.streetAddress || room?.uploadedBy?.streetAddress || "Private";
              const landmark      = req.landmark || room?.landmark || "Private";
              const location      = req.location || room?.location || "Private";
              const city          = req.roomCity || room?.city || "N/A";
              const locality      = req.roomLocality || room?.locality || "";
              const amenities     = req.roomAmenities || room?.amenities || [];

              return (
                <div key={req.id} className={`renter-req-card status-${req.status}`}>

                  {/* Card Top: Room Overview */}
                  <div className="req-card-top">
                    <div className="req-room-preview">
                      {req.roomPhoto ? (
                        <img src={req.roomPhoto} alt="Room" className="req-room-img" />
                      ) : (
                        <div className="req-room-img-placeholder">🏠</div>
                      )}
                      <div className="req-room-meta">
                        <h3 className="req-room-title">{req.roomTitle || room?.title || "Room Listing"}</h3>
                        <div className="req-room-rent">
                          ₹{(req.roomRent || room?.rent || 0).toLocaleString("en-IN")}{" "}
                          <span className="rent-unit">/ {req.roomRentType === "per_month" ? "month" : "person"}</span>
                        </div>
                        <div className="req-room-city">
                          📍 {locality ? `${locality}, ` : ""}{city}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`status-badge status-${req.status}`}>
                      {isPending && "⏳ Pending"}
                      {isAccepted && "✅ Accepted"}
                      {isRejected && "❌ Rejected"}
                    </div>
                  </div>

                  {/* Room Features Summary (Publicly Visible) */}
                  <div className="room-features-chips">
                    {(req.roomBedrooms || room?.bedrooms) && (
                      <span className="feature-chip">🛏️ {req.roomBedrooms || room?.bedrooms} BHK</span>
                    )}
                    {(req.roomBathrooms || room?.bathrooms) && (
                      <span className="feature-chip">🚿 {req.roomBathrooms || room?.bathrooms} Bath</span>
                    )}
                    {(req.roomFurnishing || room?.furnishing) && (
                      <span className="feature-chip">🛋️ {req.roomFurnishing || room?.furnishing}</span>
                    )}
                  </div>

                  {/* Amenities (Publicly Visible) */}
                  {amenities.length > 0 && (
                    <div className="amenities-row">
                      <span className="amenities-label">✨ Amenities:</span>
                      <div className="amenities-tags">
                        {amenities.map((a, i) => (
                          <span key={i} className="amenity-tag">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Privacy Banner */}
                  <div className={`privacy-banner banner-${req.status}`}>
                    {isPending && (
                      <>
                        <span className="banner-icon">🔒</span>
                        <div>
                          <strong>Owner contact & exact address are private.</strong>
                          <p>Exact property location and owner contact details will be shared after the owner accepts your rental request.</p>
                        </div>
                      </>
                    )}
                    {isRejected && (
                      <>
                        <span className="banner-icon">🚫</span>
                        <div>
                          <strong>Request Rejected.</strong>
                          <p>The owner rejected this request. Contact details and exact property location remain hidden.</p>
                        </div>
                      </>
                    )}
                    {isAccepted && (
                      <>
                        <span className="banner-icon">✅</span>
                        <div>
                          <strong>Request Accepted! Contact & Location Unlocked.</strong>
                          <p>The owner has accepted your request. You can now contact the owner directly and view the full property location below.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Contact & Location Details (REVEALED ONLY IF ACCEPTED) */}
                  {isAccepted && (
                    <div className="unlocked-details-box">
                      <h4 className="unlocked-title">🔓 Unlocked Owner & Location Information</h4>
                      <div className="unlocked-grid">
                        <div className="unlocked-item">
                          <span className="item-label">👤 Owner Name</span>
                          <span className="item-val strong">{ownerName}</span>
                        </div>
                        <div className="unlocked-item">
                          <span className="item-label">📞 Owner Phone</span>
                          <a href={`tel:${ownerContact}`} className="item-val contact-link">
                            {ownerContact}
                          </a>
                        </div>
                        <div className="unlocked-item">
                          <span className="item-label">✉️ Owner Email</span>
                          <a href={`mailto:${ownerEmail}`} className="item-val email-link">
                            {ownerEmail}
                          </a>
                        </div>
                        <div className="unlocked-item">
                          <span className="item-label">🏠 Street Address</span>
                          <span className="item-val">{streetAddress}</span>
                        </div>
                        <div className="unlocked-item">
                          <span className="item-label">🗺️ Landmark</span>
                          <span className="item-val">{landmark}</span>
                        </div>
                        <div className="unlocked-item">
                          <span className="item-label">📍 Exact GPS / Location</span>
                          <span className="item-val">{location}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="req-card-footer">
                    <span className="requested-date">📅 Sent on {req.requestedAt || "Recent"}</span>
                    <Link to={`/rooms/${req.roomId}`} className="view-room-link">
                      View Full Listing →
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default RenterRequests;
