import React from "react";

function PricingStep({ formData, setFormData, errors }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="step-container">
      <h3 className="step-heading">Step 4: Rent & Deposit</h3>
      <p className="step-desc">Enter the financial requirements for renting this room</p>

      <div className="form-row text-inputs">
        <div className="form-group half-width">
          <label className="field-label">Monthly Rent (₹) *</label>
          <div className="input-with-icon-wrap">
            <span className="input-icon-left">₹</span>
            <input
              type="number"
              name="rent"
              value={formData.rent}
              onChange={handleChange}
              placeholder="e.g. 8000"
              className={`form-control-icon ${errors.rent ? "input-error" : ""}`}
            />
          </div>
          {errors.rent && <span className="error-msg">{errors.rent}</span>}
        </div>

        <div className="form-group half-width">
          <label className="field-label">Rent Type *</label>
          <div className="rent-type-selector">
            <button
              type="button"
              className={`selector-btn ${formData.rentType === "per_month" ? "selected" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, rentType: "per_month" }))}
            >
              📅 Per Month
            </button>
            <button
              type="button"
              className={`selector-btn ${formData.rentType === "per_person" ? "selected" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, rentType: "per_person" }))}
            >
              👤 Per Person
            </button>
          </div>
        </div>
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Security Deposit (₹) *</label>
          <div className="input-with-icon-wrap">
            <span className="input-icon-left">₹</span>
            <input
              type="number"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              placeholder="e.g. 16000"
              className={`form-control-icon ${errors.deposit ? "input-error" : ""}`}
            />
          </div>
          {errors.deposit && <span className="error-msg">{errors.deposit}</span>}
        </div>

        <div className="form-group half-width">
          <label className="field-label">Price Negotiable?</label>
          <select
            name="negotiable"
            value={formData.negotiable}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Maintenance Charges</label>
          <select
            name="maintenance"
            value={formData.maintenance}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="Included">Included in Rent</option>
            <option value="Separate">Separate charges</option>
          </select>
        </div>

        {formData.maintenance === "Separate" && (
          <div className="form-group half-width">
            <label className="field-label">Maintenance Amount (₹/month)</label>
            <div className="input-with-icon-wrap">
              <span className="input-icon-left">₹</span>
              <input
                type="number"
                name="maintenanceAmount"
                value={formData.maintenanceAmount}
                onChange={handleChange}
                placeholder="e.g. 1000"
                className="form-control-icon"
              />
            </div>
          </div>
        )}
      </div>

      <div className="form-row text-inputs" style={{ marginTop: "16px" }}>
        <div className="form-group half-width">
          <label className="field-label">Electricity Bill</label>
          <select
            name="electricity"
            value={formData.electricity}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="Separate">Separate (as per sub-meter/bill)</option>
            <option value="Included">Included in rent</option>
          </select>
        </div>

        <div className="form-group half-width">
          <label className="field-label">Water Charges</label>
          <select
            name="water"
            value={formData.water}
            onChange={handleChange}
            className="form-control-select"
          >
            <option value="Included">Included in rent</option>
            <option value="Separate">Separate charges</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default PricingStep;
