import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/OwnerRequests.css";

function OwnerRequests({ requests = [], onRequestStatusChange, currentUserId, rooms = [] }) {
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "accepted" | "rejected"
  const [selectedAadhaar, setSelectedAadhaar] = useState(null); // for modal view of Aadhaar images

  // Filter requests that belong to rooms owned by current user
  // If ownerId is present, check currentUserId === ownerId.
  // Fallback: match roomId against rooms owned by current user.
  const myRoomIds = new Set(
    rooms.filter((r) => r.ownerId != null && Number(r.ownerId) === Number(currentUserId)).map((r) => r.id)
  );

  const incomingRequests = requests.filter((r) => {
    if (r.ownerId != null && currentUserId != null) {
      return Number(r.ownerId) === Number(currentUserId);
    }
    return myRoomIds.has(r.roomId);
  });

  const pendingCount  = incomingRequests.filter((r) => r.status === "pending").length;
  const acceptedCount = incomingRequests.filter((r) => r.status === "accepted").length;
  const rejectedCount = incomingRequests.filter((r) => r.status === "rejected").length;

  const filteredRequests = incomingRequests.filter((r) => {
    if (filter === "pending")  return r.status === "pending";
    if (filter === "accepted") return r.status === "accepted";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  return (
    <div className="owner-req-page">
      <div className="owner-req-container">

        {/* ── Page Header ── */}
        <div className="owner-req-header">
          <div>
            <h1 className="owner-req-title">📥 Incoming Rental Requests</h1>
            <p className="owner-req-sub">
              Review and manage rental requests sent by interested renters for your property listings.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="owner-req-alert-badge">
              🔔 {pendingCount} Pending Request{pendingCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div className="owner-req-stats">
          <div className="stat-card stat-total">
            <span className="stat-num">{incomingRequests.length}</span>
            <span className="stat-label">Total Requests</span>
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
        <div className="owner-req-tabs">
          <button
            className={`tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({incomingRequests.length})
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
          <div className="owner-req-empty">
            <div className="empty-icon">📥</div>
            <h2>No requests found</h2>
            <p>
              {filter === "all"
                ? "You haven't received any rental requests yet. Check back when renters contact you."
                : `No requests with '${filter}' status.`}
            </p>
            <Link to="/addroom" className="add-listing-btn">
              + Add a New Listing
            </Link>
          </div>
        ) : (
          <div className="owner-req-list">
            {filteredRequests.map((req) => (
              <div key={req.id} className={`owner-req-card status-${req.status}`}>

                {/* Card Header: Room Info */}
                <div className="req-card-top">
                  <div className="req-room-preview">
                    {req.roomPhoto ? (
                      <img src={req.roomPhoto} alt="Room" className="req-room-img" />
                    ) : (
                      <div className="req-room-img-placeholder">🏠</div>
                    )}
                    <div className="req-room-meta">
                      <h3 className="req-room-title">{req.roomTitle || "Room Listing"}</h3>
                      <div className="req-room-rent">
                        ₹{(req.roomRent || 0).toLocaleString("en-IN")}{" "}
                        <span className="rent-unit">/ {req.roomRentType === "per_month" ? "month" : "person"}</span>
                      </div>
                      {req.roomCity && <div className="req-room-city">📍 {req.roomCity}</div>}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`status-badge status-${req.status}`}>
                    {req.status === "pending" && "⏳ Pending"}
                    {req.status === "accepted" && "✅ Accepted"}
                    {req.status === "rejected" && "❌ Rejected"}
                  </div>
                </div>

                {/* Card Body: Renter Details */}
                <div className="req-card-body">
                  <div className="renter-info-grid">
                    <div className="info-item">
                      <span className="info-label">👤 Renter Name</span>
                      <span className="info-val strong">{req.name || "N/A"}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">📞 Contact Number</span>
                      <a href={`tel:${req.contact}`} className="info-val contact-link">
                        {req.contact || "N/A"}
                      </a>
                    </div>

                    <div className="info-item">
                      <span className="info-label">🆔 Aadhaar Number</span>
                      <span className="info-val">{req.adharNumber || "Not Provided"}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">📅 Request Date</span>
                      <span className="info-val">{req.requestedAt || "N/A"}</span>
                    </div>
                  </div>

                  {/* Aadhaar Images preview if uploaded */}
                  {(req.adharFront || req.adharBack) && (
                    <div className="aadhaar-preview-row">
                      <span className="info-label">📄 Aadhaar Documents:</span>
                      <div className="aadhaar-thumbs">
                        {req.adharFront && (
                          <button
                            className="aadhaar-thumb-btn"
                            onClick={() => setSelectedAadhaar(req.adharFront)}
                          >
                            🖼️ Front Photo
                          </button>
                        )}
                        {req.adharBack && (
                          <button
                            className="aadhaar-thumb-btn"
                            onClick={() => setSelectedAadhaar(req.adharBack)}
                          >
                            🖼️ Back Photo
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {req.message && (
                    <div className="req-message-box">
                      <span className="info-label">💬 Renter Message:</span>
                      <p className="message-text">"{req.message}"</p>
                    </div>
                  )}
                </div>

                {/* Card Footer: Actions */}
                <div className="req-card-footer">
                  {req.status === "pending" ? (
                    <div className="action-buttons">
                      <button
                        className="btn-accept"
                        onClick={() => onRequestStatusChange(req.id, "accepted")}
                      >
                        ✓ Accept Request
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => onRequestStatusChange(req.id, "rejected")}
                      >
                        ✕ Reject Request
                      </button>
                    </div>
                  ) : (
                    <div className="status-resolved-msg">
                      {req.status === "accepted" ? (
                        <span className="accepted-msg">
                          ✅ You accepted this request. Contact details and property address have been shared with the renter.
                        </span>
                      ) : (
                        <span className="rejected-msg">
                          ❌ You rejected this request. Property contact and location details remain hidden.
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ── Aadhaar Modal ── */}
        {selectedAadhaar && (
          <div className="modal-overlay" onClick={() => setSelectedAadhaar(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🆔 Aadhaar Document</h3>
                <button className="close-btn" onClick={() => setSelectedAadhaar(null)}>✕</button>
              </div>
              <div className="modal-body">
                <img src={selectedAadhaar} alt="Aadhaar Document" className="aadhaar-full-img" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default OwnerRequests;
