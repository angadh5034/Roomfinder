import React from "react";

function BasicDetailsStep({ formData, setFormData, errors }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 1: Basic Details</h3>
      <p className="step-desc">Enter core details about the property type and availability</p>
      
      <div className="form-group">
        <label className="field-label">Listing Type *</label>
        <div className="options-grid">
          {[
            { id: "private_room", label: "Private Room" },
            { id: "shared_room", label: "Shared Room" },
            { id: "flat_house", label: "Entire Flat or House" },
            { id: "pg_hostel", label: "PG or Hostel" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`option-card ${formData.listingType === opt.id ? "selected" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, listingType: opt.id }))}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="field-label">Property Type *</label>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          className="form-control-select"
        >
          {["Apartment", "Independent House", "Villa", "Penthouse", "PG", "Hostel", "Other"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="field-label">Listing Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Spacious 1 BHK in Shivaji Nagar"
          className={`form-control ${errors.title ? "input-error" : ""}`}
        />
        {errors.title && <span className="error-msg">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label className="field-label">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe your property, rules, guidelines, etc."
          className={`form-control-textarea ${errors.description ? "input-error" : ""}`}
        />
        {errors.description && <span className="error-msg">{errors.description}</span>}
      </div>

      <div className="form-row text-inputs">
        <div className="form-group half-width">
          <label className="field-label">Available From Date *</label>
          <input
            type="date"
            name="availableFrom"
            value={formData.availableFrom}
            onChange={handleChange}
            className={`form-control ${errors.availableFrom ? "input-error" : ""}`}
          />
          {errors.availableFrom && <span className="error-msg">{errors.availableFrom}</span>}
        </div>

        <div className="form-group half-width">
          <label className="field-label">Furnishing Status *</label>
          <select
            name="furnishing"
            value={formData.furnishing}
            onChange={handleChange}
            className="form-control-select"
          >
            {["Furnished", "Semi-furnished", "Unfurnished"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default BasicDetailsStep;
