import React from "react";

const AMENITIES_LIST = [
  { id: "wifi", label: "Wi-Fi", icon: "🌐" },
  { id: "ac", label: "AC", icon: "❄️" },
  { id: "refrigerator", label: "Refrigerator", icon: "🧊" },
  { id: "cctv", label: "CCTV", icon: "📹" },
  { id: "bed", label: "Bed", icon: "🛏️" },
  { id: "cupboard", label: "Cupboard", icon: "🚪" },
  { id: "washing_machine", label: "Washing Machine", icon: "🧺" },
  { id: "parking", label: "Parking", icon: "🅿️" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "water_supply", label: "Water Supply", icon: "🚰" },
  { id: "power_backup", label: "Power Backup", icon: "⚡" },
  { id: "fan", label: "Fan", icon: "🌀" },
  { id: "attached_bathroom", label: "Attached Bathroom", icon: "🛁" },
  { id: "tv", label: "TV", icon: "📺" },
];

function AmenitiesStep({ formData, setFormData }) {
  const toggleAmenity = (id) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, amenities: next };
    });
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 5: Amenities</h3>
      <p className="step-desc">Select the conveniences and facilities provided with the room</p>

      <div className="amenities-grid">
        {AMENITIES_LIST.map((item) => {
          const isSelected = (formData.amenities || []).includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`amenity-card ${isSelected ? "selected" : ""}`}
              onClick={() => toggleAmenity(item.id)}
            >
              <span className="amenity-icon">{item.icon}</span>
              <span className="amenity-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AmenitiesStep;
