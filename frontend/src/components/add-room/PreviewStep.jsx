import React, { useState } from "react";

const AMENITIES_META = {
  wifi: { label: "Wi-Fi", icon: "🌐" },
  ac: { label: "AC", icon: "❄️" },
  refrigerator: { label: "Refrigerator", icon: "🧊" },
  cctv: { label: "CCTV", icon: "📹" },
  bed: { label: "Bed", icon: "🛏️" },
  cupboard: { label: "Cupboard", icon: "🚪" },
  washing_machine: { label: "Washing Machine", icon: "🧺" },
  parking: { label: "Parking", icon: "🅿️" },
  kitchen: { label: "Kitchen", icon: "🍳" },
  water_supply: { label: "Water Supply", icon: "🚰" },
  power_backup: { label: "Power Backup", icon: "⚡" },
  fan: { label: "Fan", icon: "🌀" },
  attached_bathroom: { label: "Attached Bathroom", icon: "🛁" },
  tv: { label: "TV", icon: "📺" },
};

function PreviewStep({ formData, previews, onPublish, errors, setErrors }) {
  const [confirmed, setConfirmed] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const handlePublishClick = () => {
    if (!confirmed) {
      setErrors((prev) => ({ ...prev, confirm: "You must confirm the accuracy of information before publishing." }));
      return;
    }
    setErrors((prev) => ({ ...prev, confirm: "" }));
    onPublish();
  };

  const selectedAmenities = formData.amenities || [];
  const listingTypeLabel = {
    private_room: "Private Room",
    shared_room: "Shared Room",
    flat_house: "Entire Flat/House",
    pg_hostel: "PG/Hostel",
  }[formData.listingType] || "Room";

  return (
    <div className="step-container preview-step-container">
      <h3 className="step-heading">Step 9: Preview Listing</h3>
      <p className="step-desc">Review your room listing exactly how tenants will see it</p>

      <div className="preview-listing-card">
        {/* Photo Gallery */}
        {previews && previews.length > 0 && (
          <div className="preview-gallery">
            <div className="preview-large-photo">
              <img src={previews[activePhotoIdx]?.url} alt="Room Detail Large" />
              <span className="photo-badge">
                {activePhotoIdx + 1} / {previews.length}
              </span>
            </div>
            <div className="preview-thumbnails">
              {previews.map((p, idx) => (
                <div
                  key={idx}
                  className={`thumb-wrap ${idx === activePhotoIdx ? "active" : ""}`}
                  onClick={() => setActivePhotoIdx(idx)}
                >
                  <img src={p.url} alt={`Room Detail Thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Details */}
        <div className="preview-body">
          <div className="preview-header-row">
            <div>
              <span className="preview-type-tag">{listingTypeLabel} • {formData.furnishing}</span>
              <h2 className="preview-title">{formData.title || "Spacious Room Listing"}</h2>
              <div className="preview-location-text">📍 {formData.locality}, {formData.city}</div>
            </div>
            <div className="preview-rent-box">
              <div className="preview-rent-value">₹{Number(formData.rent).toLocaleString("en-IN")}</div>
              <div className="preview-rent-label">/ {formData.rentType === "per_month" ? "month" : "person"}</div>
            </div>
          </div>

          <div className="preview-details-grid">
            <div className="detail-item-card">
              <span className="dic-val">{formData.bedrooms}</span>
              <span className="dic-label">Bedrooms</span>
            </div>
            <div className="detail-item-card">
              <span className="dic-val">{formData.bathrooms}</span>
              <span className="dic-label">Bathrooms</span>
            </div>
            <div className="detail-item-card">
              <span className="dic-val">{formData.occupancy}</span>
              <span className="dic-label">Guests Max</span>
            </div>
            <div className="detail-item-card">
              <span className="dic-val">Floor {formData.floor}</span>
              <span className="dic-label">of {formData.totalFloors}</span>
            </div>
          </div>

          {/* Pricing Metadata */}
          <div className="preview-section">
            <h4 className="preview-section-title">Cost details</h4>
            <ul className="preview-list-details">
              <li><strong>Security Deposit:</strong> ₹{Number(formData.deposit).toLocaleString("en-IN")} (Negotiable: {formData.negotiable})</li>
              <li><strong>Maintenance charges:</strong> {formData.maintenance === "Included" ? "Included in rent" : `₹${formData.maintenanceAmount}/month`}</li>
              <li><strong>Electricity bill:</strong> {formData.electricity === "Included" ? "Included in rent" : "Separate meters"}</li>
              <li><strong>Water bill:</strong> {formData.water === "Included" ? "Included in rent" : "Separate charges"}</li>
            </ul>
          </div>

          {/* Description */}
          <div className="preview-section">
            <h4 className="preview-section-title">Description</h4>
            <p className="preview-description-text">{formData.description || "No description provided."}</p>
          </div>

          {/* Amenities */}
          <div className="preview-section">
            <h4 className="preview-section-title">Amenities</h4>
            {selectedAmenities.length > 0 ? (
              <div className="preview-amenities-tags">
                {selectedAmenities.map((id) => {
                  const meta = AMENITIES_META[id];
                  if (!meta) return null;
                  return (
                    <span key={id} className="preview-amenity-tag">
                      {meta.icon} {meta.label}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="no-items-text">No amenities listed.</p>
            )}
          </div>

          {/* Rules */}
          <div className="preview-section">
            <h4 className="preview-section-title">House Rules & Preferences</h4>
            <ul className="preview-rules-list">
              <li>👥 <strong>Preferred Tenant:</strong> {formData.preferredTenant}</li>
              <li>🍲 <strong>Food preference:</strong> {formData.foodPreference === "Veg only" ? "Vegetarian only" : "Any"}</li>
              <li>🚭 <strong>Smoking:</strong> {formData.smokingAllowed}</li>
              <li>🐕 <strong>Pets:</strong> {formData.petsAllowed}</li>
              <li>👤 <strong>Visitors:</strong> {formData.visitorRules}</li>
              {formData.additionalRules && (
                <li className="rules-note">
                  📝 <strong>Note:</strong> {formData.additionalRules}
                </li>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="preview-section preview-contact-section">
            <h4 className="preview-section-title">Contact Details (Privacy Safe)</h4>
            <div className="preview-contact-box">
              <div className="pcb-name">👤 {formData.contactName}</div>
              <div className="pcb-method">Preferred Contact: <strong>{formData.preferredContact}</strong></div>
              {formData.hidePhone ? (
                <div className="pcb-phone-shield">📞 Phone number hidden publicly (verified inquiries only)</div>
              ) : (
                <div className="pcb-phone">📞 Phone: {formData.contactPhone} • Email: {formData.contactEmail}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-box">
        <label className="checkbox-label confirm-accuracy-label">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              setErrors((prev) => ({ ...prev, confirm: "" }));
            }}
          />
          <span>I confirm that all information provided is accurate and representative of the room.</span>
        </label>
        {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
      </div>

      <div className="preview-actions-row">
        <button
          type="button"
          onClick={handlePublishClick}
          className="publish-submit-btn"
        >
          🚀 Publish Room Listing
        </button>
      </div>
    </div>
  );
}

export default PreviewStep;
