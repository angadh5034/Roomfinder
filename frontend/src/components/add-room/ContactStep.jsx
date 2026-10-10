import React from "react";

function ContactStep({ formData, setFormData, errors }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 8: Contact Details</h3>
      <p className="step-desc">Confirm the contact details for receiving renter inquiries</p>

      <div className="contact-prefill-badge">
        <span>ℹ️</span> Prefilled from your user profile. You can modify these details specifically for this listing.
      </div>

      <div className="form-group">
        <label className="field-label">Contact Name *</label>
        <input
          type="text"
          name="contactName"
          value={formData.contactName}
          onChange={handleChange}
          placeholder="e.g. Bhagyashri Tatevar"
          className={`form-control ${errors.contactName ? "input-error" : ""}`}
        />
        {errors.contactName && <span className="error-msg">{errors.contactName}</span>}
      </div>

      <div className="form-row text-inputs">
        <div className="form-group half-width">
          <label className="field-label">Contact Phone *</label>
          <input
            type="text"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            maxLength={10}
            className={`form-control ${errors.contactPhone ? "input-error" : ""}`}
          />
          {errors.contactPhone && <span className="error-msg">{errors.contactPhone}</span>}
        </div>

        <div className="form-group half-width">
          <label className="field-label">Contact Email *</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="e.g. bhagyashri@email.com"
            className={`form-control ${errors.contactEmail ? "input-error" : ""}`}
          />
          {errors.contactEmail && <span className="error-msg">{errors.contactEmail}</span>}
        </div>
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Preferred Contact Method</label>
          <select
            name="preferredContact"
            value={formData.preferredContact}
            onChange={handleChange}
            className="form-control-select"
          >
            {["Phone", "WhatsApp", "Email"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="form-group half-width" style={{ display: "flex", alignItems: "center" }}>
          <label className="checkbox-label" style={{ marginTop: "24px" }}>
            <input
              type="checkbox"
              name="hidePhone"
              checked={formData.hidePhone}
              onChange={handleChange}
            />
            <span>Hide phone number publicly (only show to verified requests)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ContactStep;
