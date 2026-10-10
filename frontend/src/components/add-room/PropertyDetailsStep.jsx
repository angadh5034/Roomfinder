import React from "react";

function PropertyDetailsStep({ formData, setFormData, errors }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleNumberChange = (name, change) => {
    setFormData((prev) => {
      const current = Number(prev[name]) || 0;
      const next = Math.max(0, current + change);
      return { ...prev, [name]: next };
    });
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 3: Room & Property Details</h3>
      <p className="step-desc">Enter the specific configuration details of your room</p>

      <div className="form-row counters-row">
        <div className="form-group counter-group">
          <label className="field-label">Bedrooms *</label>
          <div className="counter-wrap">
            <button type="button" className="counter-btn" onClick={() => handleNumberChange("bedrooms", -1)}>-</button>
            <input type="number" className="counter-input" name="bedrooms" value={formData.bedrooms} readOnly />
            <button type="button" className="counter-btn" onClick={() => handleNumberChange("bedrooms", 1)}>+</button>
          </div>
        </div>

        <div className="form-group counter-group">
          <label className="field-label">Bathrooms *</label>
          <div className="counter-wrap">
            <button type="button" className="counter-btn" onClick={() => handleNumberChange("bathrooms", -1)}>-</button>
            <input type="number" className="counter-input" name="bathrooms" value={formData.bathrooms} readOnly />
            <button type="button" className="counter-btn" onClick={() => handleNumberChange("bathrooms", 1)}>+</button>
          </div>
        </div>

        <div className="form-group counter-group">
          <label className="field-label">Occupancy Capacity *</label>
          <div className="counter-wrap">
            <button type="button" className="counter-btn" onClick={() => handleNumberChange("occupancy", -1)}>-</button>
            <input type="number" className="counter-input" name="occupancy" value={formData.occupancy} readOnly />
            <button type="button" className="counter-btn" onClick={() => handleNumberChange("occupancy", 1)}>+</button>
          </div>
        </div>
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Property Floor *</label>
          <input
            type="number"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            min={0}
            className={`form-control ${errors.floor ? "input-error" : ""}`}
          />
          {errors.floor && <span className="error-msg">{errors.floor}</span>}
        </div>

        <div className="form-group half-width">
          <label className="field-label">Total Floors *</label>
          <input
            type="number"
            name="totalFloors"
            value={formData.totalFloors}
            onChange={handleChange}
            min={1}
            className={`form-control ${errors.totalFloors ? "input-error" : ""}`}
          />
          {errors.totalFloors && <span className="error-msg">{errors.totalFloors}</span>}
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "16px" }}>
        <label className="field-label">Features</label>
        <div className="checkboxes-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="hasBalcony"
              checked={formData.hasBalcony}
              onChange={handleChange}
            />
            <span>Has Balcony</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="hasAttachedBathroom"
              checked={formData.hasAttachedBathroom}
              onChange={handleChange}
            />
            <span>Has Attached Bathroom</span>
          </label>
        </div>
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Property Age</label>
          <select
            name="propertyAge"
            value={formData.propertyAge}
            onChange={handleChange}
            className="form-control-select"
          >
            {["New", "1-3 Years", "3-5 Years", "5+ Years"].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="form-group half-width">
          <label className="field-label">Parking Available</label>
          <select
            name="parking"
            value={formData.parking}
            onChange={handleChange}
            className="form-control-select"
          >
            {["None", "Bike Only", "Car & Bike"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailsStep;
