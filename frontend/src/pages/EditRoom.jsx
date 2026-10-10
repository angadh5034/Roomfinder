import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/EditRoom.css";

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function computeStatus(room) {
  if (room.manualStatus) return room.manualStatus;
  return daysSince(room.postedAt) >= 28 ? "inactive" : "active";
}

// Demo room to edit (in real app, pass via props or route state)
const demoRoom = {
  id: 1,
  photos: [
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  ],
  rent: 7500,
  rentType: "per_month",
  location: "Near Sitabuldi Market, Nagpur 440012",
  notes: "Fully furnished room with WiFi, attached bathroom, 24hr water supply. Preferred for working professionals.",
  postedAt: "2026-05-01",
  manualStatus: null,
};

function EditRoom({ room = demoRoom, onSave }) {
  const navigate = useNavigate();
  const currentStatus = computeStatus(room);
  const days = daysSince(room.postedAt);

  const [form, setForm] = useState({
    rent:         room.rent,
    rentType:     room.rentType,
    location:     room.location,
    notes:        room.notes,
    manualStatus: currentStatus,
  });

  const [photos, setPhotos]       = useState(room.photos);
  const [newPreviews, setNewPreviews] = useState([]);
  const [errors, setErrors]       = useState({});
  const [saved, setSaved]         = useState(false);

  // ── field change ──
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── add more photos ──
  const handleNewPhotos = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((p) => [...p, ...previews]);
    setPhotos((p) => [...p, ...previews]);
  };

  // ── remove a photo ──
  const removePhoto = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
    setNewPreviews((p) => p.filter((_, i) => i !== index - room.photos.length));
  };

  // ── validation ──
  const validate = () => {
    const e = {};
    if (!form.rent || isNaN(form.rent) || Number(form.rent) <= 0)
      e.rent = "Enter a valid rent amount";
    if (!form.location.trim()) e.location = "Location is required";
    if (photos.length === 0) e.photos = "At least 1 photo is required";
    return e;
  };

  // ── save ──
  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const updated = {
      ...room,
      ...form,
      rent: Number(form.rent),
      status: form.manualStatus || room.status || "active",
      notes: form.notes || room.notes || form.description || "",
      photos,
    };

    if (onSave) onSave(updated);
    setSaved(true);
    setTimeout(() => navigate("/profile"), 1500);
  };

  const handleCancel = () => navigate("/profile");

  return (
    <div className="editroom-page">
      <div className="editroom-wrapper">

        {/* ── Page Header ── */}
        <div className="editroom-topbar">
          <button className="back-btn" onClick={handleCancel}>
            ← Back
          </button>
          <div className="topbar-info">
            <h1 className="page-title">✏️ Edit Room</h1>
            <p className="page-sub">Update your room details below</p>
          </div>
        </div>

        {/* ── Saved Banner ── */}
        {saved && (
          <div className="saved-banner">
            ✅ Room updated successfully! Redirecting to profile...
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="editroom-grid">

          {/* LEFT COLUMN */}
          <div className="editroom-left">

            {/* Photos Section */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-step">📷</span>
                <h2>Room Photos</h2>
              </div>

              {errors.photos && <p className="edit-err-msg">{errors.photos}</p>}

              <div className="photo-grid">
                {photos.map((src, i) => (
                  <div key={i} className="photo-tile">
                    <img src={src} alt={`Room ${i + 1}`} />
                    <button
                      className="photo-remove"
                      onClick={() => removePhoto(i)}
                      title="Remove photo"
                    >✕</button>
                    {i === 0 && <span className="photo-main-badge">Main</span>}
                  </div>
                ))}

                {/* Add more tile */}
                <label className="photo-add-tile" htmlFor="photo-upload">
                  <span className="plus-icon">+</span>
                  <p>Add photo</p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewPhotos}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {/* Notes Section */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-step">📝</span>
                <h2>Notes / Description</h2>
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handle}
                rows={5}
                className="edit-textarea"
                placeholder="Describe the room — amenities, rules, availability..."
              />
              <span className="char-count">{form.notes.length} characters</span>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="editroom-right">

            {/* Rent Section */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-step">💰</span>
                <h2>Rent</h2>
              </div>
              <div className="rent-input-row">
                <div className={`rent-input-wrap ${errors.rent ? "field-error" : ""}`}>
                  <span className="currency">₹</span>
                  <input
                    type="number"
                    name="rent"
                    value={form.rent}
                    onChange={handle}
                    placeholder="Enter amount"
                    className="rent-field"
                    min="0"
                  />
                </div>
              </div>
              {errors.rent && <span className="edit-err-msg">{errors.rent}</span>}

              <div className="rent-type-row">
                <button
                  type="button"
                  className={`rent-type-btn ${form.rentType === "per_month" ? "rent-type-sel" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, rentType: "per_month" }))}
                >
                  📅 Per Month
                </button>
                <button
                  type="button"
                  className={`rent-type-btn ${form.rentType === "per_person" ? "rent-type-sel" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, rentType: "per_person" }))}
                >
                  👤 Per Person
                </button>
              </div>

              {form.rent > 0 && (
                <div className="rent-preview">
                  ₹{Number(form.rent).toLocaleString("en-IN")} / {form.rentType === "per_month" ? "month" : "person"}
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-step">📍</span>
                <h2>Location</h2>
              </div>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handle}
                placeholder="e.g. Near Nagpur Railway Station, Sitabuldi"
                className={`edit-input ${errors.location ? "field-error" : ""}`}
              />
              {errors.location && <span className="edit-err-msg">{errors.location}</span>}
              <p className="field-hint">📌 Location is only shown when visitor clicks "More.."</p>
            </div>

            {/* Status Section */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-step">🔘</span>
                <h2>Room Status</h2>
              </div>

              {days >= 28 && !form.manualStatus && (
                <div className="auto-expire-warn">
                  ⏰ This room is <strong>{days} days old</strong> — auto-expired after 28 days. Set to Active to relist.
                </div>
              )}

              <div className="status-opts">
                <button
                  type="button"
                  className={`status-opt-btn ${form.manualStatus === "active" ? "status-active-sel" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, manualStatus: "active" }))}
                >
                  <div className="status-left">
                    <span className="status-dot dot-active">●</span>
                    <div>
                      <div className="status-opt-title">Active</div>
                      <div className="status-opt-sub">Visible to all visitors on Home</div>
                    </div>
                  </div>
                  {form.manualStatus === "active" && <span className="status-tick">✓</span>}
                </button>

                <button
                  type="button"
                  className={`status-opt-btn ${form.manualStatus === "inactive" ? "status-inactive-sel" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, manualStatus: "inactive" }))}
                >
                  <div className="status-left">
                    <span className="status-dot dot-inactive">●</span>
                    <div>
                      <div className="status-opt-title">Inactive</div>
                      <div className="status-opt-sub">Hidden from visitors on Home</div>
                    </div>
                  </div>
                  {form.manualStatus === "inactive" && <span className="status-tick">✓</span>}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-row">
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                💾 Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EditRoom;
